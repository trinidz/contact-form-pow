import express from 'express';
const router = express.Router();
import { body } from 'express-validator'
import {formRegistration, formValidation} from '../controllers/controllers.js'

router
    .get('/register', formRegistration)
    .post('/register',
        [
            body("participation").notEmpty().withMessage("You must check the 'I agree to the EULA checkbox'."),
            body("name").trim().notEmpty().withMessage("Name can not be empty.")
                .isLength({ max: 40 }).withMessage("Name is too long. (40 characters max)"),
            body("email").trim().isEmail().withMessage("Invalid email.")
                .isLength({ max: 40 }).withMessage("E-mail is too long. (40 characters max)"),
            body("comment").isLength({ max: 140 }).withMessage("Comment is too long. (140 characters max)"),
            body("region").notEmpty().withMessage("You must select a region."),
            body("firstPref").if(body("region").equals("amer-carrib")).notEmpty()
                .withMessage("You must select."),
        ],
        formValidation)

export default router