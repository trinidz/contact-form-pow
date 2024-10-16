import { fileURLToPath } from 'url'
import { dirname } from 'path'
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { matchedData, validationResult } from 'express-validator'

import nodemailer from "nodemailer";
import {logEvents} from '../middleware/logEvents.js'
import dotenv from 'dotenv'
dotenv.config()
import { hc_CheckStamp, hc_CreateStamp, HASHCASH_DIFFICULTY } from '../private/hashcash_server.js'

const YOUR_FROM_EMAIL_ADDRESS = process.env.YOUR_FROM_EMAIL_ADDRESS
const YOUR_TO_EMAIL_ADDRESS = process.env.YOUR_TO_EMAIL_ADDRESS
const SMTPHOST = process.env.SMTPHOST || "smtp.emailserver.com"
const SMTPPORT = process.env.SMTPPORT || 25
const SMTPUSER = process.env.SMTPUSER || "my_account@email.com"
const SMTPPASS = process.env.SMTPPASS || "my_password"
const SMTPSECURE = process.env.SMTPSECURE.toLowerCase() == 'true' ? true : false

export const formRegistration = (req, res) => {
    const hc_ip = (req.headers['x-forwarded-for'] || req.headers.origin || req.socket.remoteAddress).split(':').pop()
    const stamp = hc_CreateStamp(hc_ip)
    res.render('index', { hc_stamp: `${stamp}`, hc_difficulty: `${HASHCASH_DIFFICULTY}`, hc_ip: `${hc_ip}`, errors: '' })
}

//collect registration form info and validate
export const formValidation = (req, res) => {

  //quick check for spam
  if (req.body._gotcha) {
    logEvents(`Spam Gotcha: ${req.body._gotcha}`, 'registerLog.txt')
      .then(() => {
        return res.status(404)
      })
  }

  //validate posted form data check
  const errors = validationResult(req)

  //if there is invalid input in the form data 
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() })
  } else if (req.body.hc_nonce) {
    //client solved hash
    console.log(`nonce: ${req.body.hc_nonce}`)
  } else {
    //form data is valid but client needs to solve hash
    return res.status(200).json({ result: true })
  }

  hc_CheckStamp(req.body.hc_stamp, req.body.hc_difficulty, req.body.hc_nonce, req.body.hc_ip)
    .then((val) => {
      if (!val) {
        let error_desc = "Sorry. Your registration form has expired."
        let error_todo = "Please refresh the page and try again."
        res.render('error', { error_msg_desc: `${error_desc}`, error_msg_todo: `${error_todo}` })
      }
    })

  const validatedData = matchedData(req)

  const transporter = nodemailer.createTransport({
    host: SMTPHOST,
    port: SMTPPORT,
    secure: SMTPSECURE,
    auth: {
      user: SMTPUSER, // this should be YOUR email account account
      pass: SMTPPASS // this should be your password
    }
  });

  var textBody = `NAME: ${validatedData.name}\nEMAIL: ${validatedData.email}\nREGION: ${validatedData.region}\nFIRST PREFERENCE: ${validatedData.firstPref}\nMESSAGE: ${validatedData.comment}`;
  var logTextBody = `NAME: ${validatedData.name}, EMAIL: ${validatedData.email}, REGION: ${validatedData.region}, FIRST PREFERENCE: ${validatedData.firstPref}, MESSAGE: ${validatedData.comment}`;  
  //var htmlBody = `<h2>Mail From Contact Form</h2><p>from: ${validatedData.name} <a href="mailto:${validatedData.email}">${validatedData.email}</a></p><p>${validatedData.comment}</p>`;

  var mail = {
    from: YOUR_FROM_EMAIL_ADDRESS, // sender address
    to: YOUR_TO_EMAIL_ADDRESS, // list of receivers (THIS COULD BE A DIFFERENT ADDRESS or ADDRESSES SEPARATED BY COMMAS)
    subject: "My Registration Form", // Subject line
    text: textBody,
    //html: htmlBody
  };

  // send mail with defined transport object
  transporter.sendMail(mail, function (err, info) {
    let mailStatus
    if (err) {
      mailStatus = err
      res.render('error', {
        error_msg_desc: "Sorry. We are unable to process your registration.",
        error_msg_todo: `Please contact ${YOUR_TO_EMAIL_ADDRESS} for help.`
      })
      logEvents(`${mailStatus}\t${logTextBody}`, 'errorlog.txt')
    } else {
      mailStatus = info.response
      res.redirect('/success.html')
    }
    logEvents(`${mailStatus}\t${logTextBody}`, 'registerLog.txt')
  });
}
