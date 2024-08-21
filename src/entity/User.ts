import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
  JoinTable,
} from "typeorm";
import { IsEmail, IsNotEmpty } from "class-validator";
import { Event } from "./Event";
import { Permission } from "./permission";
import { Attendance } from "./attendance";
import { RSVP } from "./rsvp";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @IsNotEmpty({ message: "First name is required" })
  firstName!: string;

  @Column()
  @IsNotEmpty({ message: "Last name is required" })
  lastName!: string;

  @Column({ unique: true })
  @IsEmail({}, { message: "Email must be valid" })
  @IsNotEmpty({ message: "Email is required" })
  email!: string;

  @Column()
  @IsNotEmpty({ message: "Gender is required" })
  gender!: string;

  @Column()
  @IsNotEmpty({ message: "Password is required" })
  password!: string;

  @Column()
  phone!: string;

  @Column({ default: false })
  isVerified!: boolean;

  @Column({ nullable: true })
  profileImage!: string;

  @Column("jsonb", { nullable: true })
  token!: string | null;

  // @Column({ type: "text", nullable: true })
  // token!: string | null;

  @Column({ nullable: true })
  resetPasswordToken!: string;

  @Column({ type: "timestamp", nullable: true })
  resetPasswordExpires!: Date | null;

  @Column()
  createdAt!: Date;

  @Column()
  updatedAt!: Date;

  @OneToMany(() => Event, (event) => event.user)
  events!: Event[];

  @OneToMany(() => Attendance, (attendance) => attendance.user)
  attendances!: Attendance[];

  @OneToMany(() => RSVP, (rsvp) => rsvp.event)
  rsvps!: RSVP[];

  @OneToMany(() => Permission, (permission) => permission.user)
  permissions!: Permission[];
}

/////when do you use join table
//// when do we use manyToOne, oneToMany
