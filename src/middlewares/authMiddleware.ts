import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import dotenv from "dotenv";

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY || "secret_key";

console.log(`This is our secret key ${SECRET_KEY}`);

export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  console.log(token);
  if (!token) {
    return res.status(401).json({
      status: "Unauthorized",
      message: "No token provided",
    });
  }

  try {
    const decoded: any = jwt.verify(token, SECRET_KEY);
    const userRepository = AppDataSource.getRepository(User);
    // const userId = decoded.id;

    const user = await userRepository.findOneBy({ id: decoded.id });

    if (!user) {
      return res.status(401).json({
        status: "Unauthorized",
        message: "Invalid token",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      status: "Unauthorized",
      message: "Invalid token",
    });
  }
};

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.SECRET_KEY || "secret_key"
    ) as { userId: number };
    req.id = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
