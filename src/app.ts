import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./data-source";
import authRoutes from "./routes/authRoutes";
import dotenv from "dotenv";
import attendanceRoutes from "./routes/attendance";
import eventRoutes from "./routes/eventRoutes";
import rsvpRoutes from "./routes/rsvp";
import permissionRoutes from "./routes/permission";
// import reportRoutes from "./routes/reports";
dotenv.config();

AppDataSource.initialize()
  .then(() => {
    console.log("Database initialized");
  })
  .catch((error) => console.log(error));

const app = express();
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/attendances", attendanceRoutes);
app.use("/events", eventRoutes);
app.use("/rsvp", rsvpRoutes);
// app.use("/reports", reportRoutes);
app.use("/permissions", permissionRoutes);
app.get("/health", (req, res) => {
  res.sendStatus(200);
});

export default app;
