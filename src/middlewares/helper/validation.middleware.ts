import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMsg = errors.array().map(err => err.msg).join(", ");
        return res.status(400).json({ error: errorMsg });
    }
    next();
};

export const registerValidation = [

    body("full_name")
    .trim()
    .notEmpty()
    .isLength({ min: 10, max: 100 })
    .withMessage("Full name is required"),

    body("email")
    .trim()
    .notEmpty()
    .normalizeEmail()
    .isEmail()
    .withMessage("Valid email is required")
    .isLength({ max:254 })
    ,

    body("password")
    .isLength({ min : 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[-_!@#$%^&*()+?]/) 
    .withMessage('Password must contain at least one special character')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')

]