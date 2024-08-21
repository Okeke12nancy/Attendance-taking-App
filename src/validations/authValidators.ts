import { check } from "express-validator";

export const registerValidation = [
  check("firstName", "First Name is required").not().isEmpty(),
  check("lastName", "Last Name is required").not().isEmpty(),
  check("email", "Please include a valid email").isEmail(),
  check(
    "password",
    "Please enter a password with 6 or more characters"
  ).isLength({ min: 6 }),
  check("gender", "Gender is required").isIn(["male", "female"]),
  check("token").optional(),
];

export const loginValidation = [
  check("email").isEmail().withMessage("Please enter a valid email"),
  check("password")
    .isLength({ min: 2 })
    .withMessage("Password must be at least 6 characters long"),
];

export const profileUpdateValidation = [
  check("firstName")
    .optional()
    .isString()
    .withMessage("First name must be a string"),
  check("lastName")
    .optional()
    .isString()
    .withMessage("Last name must be a string"),
  check("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email"),
  check("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  check("phone")
    .optional()
    .isString()
    .withMessage("Phone number must be a string"),
  check("gender").optional().isString().withMessage("Gender must be a string"),
];

export const forgotPasswordValidation = [
  check("email").isEmail().withMessage("Please provide a valid email"),
];

export const resetPasswordValidation = [
  check("newPassword")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];
