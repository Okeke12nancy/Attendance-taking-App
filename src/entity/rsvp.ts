import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  BaseEntity,
} from "typeorm";
import { Event } from "./Event";
import { User } from "./User";

@Entity()
export class RSVP extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Event, (event) => event.rsvps)
  event!: Event;

  @ManyToOne(() => User, (user) => user.rsvps)
  user!: User;

  @Column()
  status!: string;
}
