import { check } from "express-validator";

export const eventValidation = [
  check("name").notEmpty().withMessage("Event name is required"),
  check("description").notEmpty().withMessage("Description is required"),
  check("date").isDate().withMessage("Invalid date format"),
  check("time").notEmpty().withMessage("Time is required"),
  check("location").notEmpty().withMessage("Location is required"),
];
