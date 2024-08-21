import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  BaseEntity,
} from "typeorm";
import { User } from "./User";
import { Event } from "./Event";

@Entity()
export class Attendance extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.attendances)
  @JoinColumn({ name: "userId" })
  user!: User;

  @ManyToOne(() => Event, (event) => event.attendances)
  @JoinColumn({ name: "eventId" })
  event!: Event;

  @CreateDateColumn()
  timestamp!: Date;

  @Column({ default: false })
  attended!: boolean;
}
