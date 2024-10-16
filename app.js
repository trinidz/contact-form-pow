import express from 'express'
const app = express()
import { urlencoded, json } from 'express'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import dotenv from 'dotenv'
dotenv.config()

import {logReqs} from './middleware/logEvents.js'
import {errorHandler} from './middleware/errorHandler.js'
import routeContactForm from './routes/routes.js'

const PORT = process.env.PORT || 5000

//logging middleware
app.use(logReqs)

// get/parse data in body 'posted' from a form, creates a req.body with body data in it
app.use(urlencoded({ extended: false }))

// parse json
app.use(json())

app.use('', express.static(join(__dirname,'/public')))
app.use('/css', express.static(join(__dirname, '/public/css')))
app.use('/js', express.static(join(__dirname,'/public/js')))
app.use('/img', express.static(join(__dirname,'/public/img')))

app.set('views','./views')
app.set('view engine','ejs')

app.use('', routeContactForm)

//catch unhandled requests
app.all('*', (req, res) => {
  res.status(404)
  if (req.accepts('html')) {
    res.sendFile(join(__dirname, '/public/404.html'));
  } else if (req.accepts('json')) {
    res.json({ error: "404 Not Found!" });
  } else {
    res.type('txt').send("404 Not Found!")
  }
})

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}....`)
})