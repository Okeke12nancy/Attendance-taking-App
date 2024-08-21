import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from "typeorm";
import { User } from "./User";
import { RSVP } from "./rsvp";
import { Permission } from "./permission";
import { Attendance } from "./attendance";

@Entity()
export class Event extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  description!: string;

  @Column()
  date!: string;

  @Column()
  time!: string;

  @Column()
  location!: string;

  @ManyToOne(() => User, (user) => user.events)
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ default: "public" })
  visibility!: string;

  @Column("int", { array: true, nullable: true })
  visibleTo!: number[];

  @OneToMany(() => Attendance, (attendance) => attendance.event)
  attendances!: Attendance[];

  @Column({ type: "timestamp", nullable: true })
  attendanceStartTime!: Date;

  @Column({ type: "timestamp", nullable: true })
  attendanceEndTime!: Date;

  @OneToMany(() => RSVP, (rsvp) => rsvp.event)
  rsvps!: RSVP[];

  @OneToMany(() => Permission, (permission) => permission.event)
  permissions!: Permission[];
}
