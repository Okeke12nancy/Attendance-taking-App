import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Event } from "./entity/Event";

import dotenv from "dotenv";
import { RSVP } from "./entity/rsvp";
import { Permission } from "./entity/permission";
import { Attendance } from "./entity/attendance";
dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5433"),
  username: process.env.DB_USERNAME,
  password: process.env.DBPASSWORD,
  database: process.env.DATABASE,
  entities: [User, Event, RSVP, Permission, Attendance],
  synchronize: true,
  logging: false,
  migrations: ["src/migration/**/*.ts"],
  subscribers: ["src/subscriber/**/*.ts"],
});
