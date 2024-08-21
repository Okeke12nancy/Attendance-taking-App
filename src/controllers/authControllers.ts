import { Request, Response } from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../entity/User";
import { AppDataSource } from "../data-source";
import dotenv from "dotenv";
import { validationResult } from "express-validator";
import { sendVerificationEmail } from "../services/emailService";
import { generateRandomAvatar } from "../middlewares/avatarMiddlewares";
import { sendPasswordResetEmail } from "../services/emailService";
import crypto from "crypto";
import { MoreThan } from "typeorm";
dotenv.config();

class AuthController {
  static userRepository = AppDataSource.getRepository(User);

  static async register(req: Request, res: Response) {
    console.log("Received registration request:", req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, phone, gender } = req.body;

    try {
      const existingUser = await AuthController.userRepository.findOne({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({
          status: "Bad Request",
          message: "Registration unsuccessful, user already exists",
        });
      }

      const hashedPassword = await bcryptjs.hash(password, 10);
      const profileImage = await generateRandomAvatar(email);

      const user = AuthController.userRepository.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
        gender,
        profileImage,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await AuthController.userRepository.save(user);

      const token = jwt.sign(
        { userId: user.id },
        process.env.SECRET_KEY || "secret_key",
        { expiresIn: process.env.EXPIRY_TIME || "1h" }
      );

      user.token = token;
      await AuthController.userRepository.save(user);
      await sendVerificationEmail(firstName, lastName, email, token);

      return res.status(201).json({
        status: "Success",
        message: "User registered successfully, please verify your email",
      });
    } catch (error: any) {
      console.error(error.message);
      return res.status(500).json({
        status: "Internal Server Error",
        message:
          "An error occurred during registration. Please try again later.",
      });
    }
  }

  static async verifyEmail(req: Request, res: Response) {
    const { token } = req.params;

    try {
      const decoded: any = jwt.verify(
        token,
        process.env.SECRET_KEY || "secret_key"
      );

      const user = await AuthController.userRepository.findOne({
        where: { id: decoded.userId },
      });

      if (!user) {
        return res.status(400).json({
          message: "Invalid Token, Please try again",
        });
      }

      user.isVerified = true;
      await AuthController.userRepository.save(user);

      return res.status(200).json({
        message: "Email verified successfully",
      });
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).json({
        message: "Server error",
      });
    }
  }

  static async login(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await AuthController.userRepository.findOne({
        where: { email },
      });

      if (!user) {
        return res.status(400).json({
          status: "Bad Request",
          message: "Login unsuccessful, user not found",
        });
      }

      if (!user.isVerified) {
        return res.status(400).json({
          status: "Bad Request",
          message: "Login unsuccessful, email not verified",
        });
      }

      const isPasswordValid = await bcryptjs.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          status: "Bad Request",
          message: "Login unsuccessful, invalid password",
        });
      }

      const token = jwt.sign(
        { userId: user.id },
        process.env.SECRET_KEY || "secret_key",
        { expiresIn: process.env.EXPIRY_TIME || "1h" }
      );

      const { password: _, ...userData } = user;

      return res.status(200).json({
        status: "Success",
        message: "Login successful",
        token,
        user: userData,
      });
    } catch (error: any) {
      console.error(error.message);
      return res.status(500).json({
        status: "Internal Server Error",
        message: "An error occurred during login. Please try again later.",
      });
    }
  }

  static async logout(req: Request, res: Response) {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const decoded: any = jwt.verify(
        token,
        process.env.SECRET_KEY || "secret_key"
      );
      const userId = decoded.userId;

      const user = await AuthController.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.token = null;
      await AuthController.userRepository.save(user);

      return res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    const userId = (req.user as any).id;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, phone, gender } = req.body;

    try {
      const user = await AuthController.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({
          status: "Not Found",
          message: "User not found",
        });
      }

      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (email) user.email = email;
      if (password) user.password = await bcryptjs.hash(password, 10);
      if (phone) user.phone = phone;
      if (gender) user.gender = gender;

      await AuthController.userRepository.save(user);

      return res.status(200).json({
        status: "Success",
        message: "Profile updated successfully",
      });
    } catch (error: any) {
      console.error(error.message);
      return res.status(500).json({
        status: "Internal Server Error",
        message:
          "An error occurred while updating the profile. Please try again later.",
      });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;
    try {
      const user = await AuthController.userRepository.findOne({
        where: { email },
      });

      if (!user) {
        return res.status(404).json({
          status: "Not Found",
          message: "User with this email does not exist",
        });
      }

      const token = crypto.randomBytes(20).toString("hex");
      const now = new Date();
      const expires = new Date(now.getTime() + 3600000); // 1 hour

      user.resetPasswordToken = token;
      user.resetPasswordExpires = expires;

      await AuthController.userRepository.save(user);

      await sendPasswordResetEmail(email, token);

      return res.status(200).json({
        status: "Success",
        message: "Password reset email sent",
      });
    } catch (error: any) {
      console.error(error.message);
      return res.status(500).json({
        status: "Internal Server Error",
        message:
          "An error occurred while processing your request. Please try again later.",
      });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
      const user = await AuthController.userRepository.findOne({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: MoreThan(new Date()),
        },
      });

      if (!user) {
        return res.status(400).json({
          status: "Bad Request",
          message: "Password reset token is invalid or has expired",
        });
      }

      user.password = await bcryptjs.hash(newPassword, 10);
      user.resetPasswordToken = "";
      user.resetPasswordExpires = null;

      await AuthController.userRepository.save(user);

      return res.status(200).json({
        status: "Success",
        message: "Password reset successfully",
      });
    } catch (error: any) {
      console.error(error.message);
      return res.status(500).json({
        status: "Internal Server Error",
        message:
          "An error occurred while resetting the password. Please try again later.",
      });
    }
  }
}

export default AuthController;

// static async logout(req: Request, res: Response) {
//     const token = req.headers.authorization?.replace("Bearer ", "");
//     if (!token) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     try {
//       const decoded: any = jwt.verify(
//         token,
//         process.env.SECRET_KEY || "secret_key"
//       );
//       const userId = decoded.userId;

//       const user = await AuthController.userRepository.findOne(userId);

//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }

//       user.token = null;
//       await AuthController.userRepository.save(user);

//       return res.status(200).json({ message: "Logged out successfully" });
//     } catch (err) {
//       console.error(err instanceof Error);
//       return res.status(500).json({ message: "Internal server error" });
//     }
//   }
