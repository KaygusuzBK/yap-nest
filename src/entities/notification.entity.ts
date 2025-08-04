import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum NotificationType {
  TASK_ASSIGNED = 'task_assigned',
  COMMENT_ADDED = 'comment_added',
  TASK_COMPLETED = 'task_completed',
  PROJECT_UPDATED = 'project_updated',
  DEADLINE_APPROACHING = 'deadline_approaching',
  FILE_UPLOADED = 'file_uploaded',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column()
  userId: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  relatedTaskId?: string;

  @Column({ nullable: true })
  relatedProjectId?: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.notifications)
  @JoinColumn({ name: 'userId' })
  user: User;
}
