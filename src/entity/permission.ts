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
export class Permission extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Event, (event) => event.permissions)
  event!: Event;

  @ManyToOne(() => User, (user) => user.permissions)
  user!: User;

  @Column({ default: false })
  canEdit!: boolean;

  @Column({ default: false })
  canMarkAttendance!: boolean;
}
