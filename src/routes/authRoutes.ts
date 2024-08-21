import { Router } from "express";
import AuthController from "../controllers/authControllers";
import {
  registerValidation,
  profileUpdateValidation,
} from "../validations/authValidators";
import { errorHandler } from "../middlewares/errorMiddlewae";
import { loginValidation } from "../validations/authValidators";
import { authenticateJWT } from "../middlewares/authMiddleware";

const authroutes = Router();

authroutes.post(
  "/register",
  registerValidation,
  errorHandler,
  AuthController.register
);
authroutes.get("/verify/:token", AuthController.verifyEmail);
authroutes.post("/login", loginValidation, AuthController.login);
authroutes.post("/logout", AuthController.logout);
authroutes.put(
  "/profile",
  authenticateJWT,
  profileUpdateValidation,
  AuthController.updateProfile
);
authroutes.post("/forgot", AuthController.forgotPassword);
authroutes.post("/reset-password/:token", AuthController.resetPassword);

export default authroutes;
