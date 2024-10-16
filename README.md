# contact form pow
Boilerplate code for protecting a contact form with proof of work.

This project was inspired by [hashcash-form-protect](https://github.com/jlopp/hashcash-form-protect). It is designed to run everything server-side with javascript and Node.

Javascript is used to generate a contact form in the browser that solves a hashcash proof of work puzzle before the form can be submitted. Javascript is also used to generate the hashcash puzzle and validate the proof of work produced by the browser.

## Environment Variables 
The environment variables to configure are in the sample.env file.  Copy the sample.env file to a .env file and make your changes.  You must set the 'YOUR_TO_EMAIL_ADDRESS', 'YOUR_FROM_EMAIL_ADDRESS' and 'SMTP' variables used to send emails.  The remaining variables can be left default.

1. YOUR_TO_EMAIL_ADDRESS / YOUR_FROM_EMAIL_ADDRESS - set to the addresses you want to send to / receive from the form submissions
2. SMTPHOST - smtp server
3. SMTPPORT - smtp server port number
4. SMTPSECURE - smtp server security (true or false)
5. SMTPUSER - username to login to smtp server
6. SMTPPASS - password to login to smtp server
7. HASHCASH_SALT - any random sequence of characters should suffice - just keep them secret
8. HASHCASH_DIFFICULTY - proof of work difficulty level (1 - 40); the higher the number the more difficult

## Logs
The program generates logs that are saved to the repos logs folder.

## Development
- `git clone` this repo
- `cd` into repo folder
- `npm i` to install dependancies
- `npm run dev` to start app with nodemon
- Go to http://localhost:5000/register in your browser


