import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Project } from './project.entity';
import { Comment } from './comment.entity';

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255 })
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'varchar',
    enum: Object.values(TaskStatus),
    default: TaskStatus.TODO
  })
  status: TaskStatus;

  @Column({
    type: 'varchar',
    enum: Object.values(TaskPriority),
    default: TaskPriority.MEDIUM
  })
  priority: TaskPriority;

  @Column('uuid')
  assigneeId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assigneeId' })
  assignee: User;

  @Column('uuid')
  projectId: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column('timestamp', { nullable: true })
  dueDate: Date;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  estimatedHours: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  actualHours: number;

  @Column('uuid', { nullable: true })
  parentTaskId: string;

  @ManyToOne(() => Task, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'parentTaskId' })
  parentTask: Task;

  @Column('text', { array: true, default: [] })
  tags: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Task, task => task.parentTask)
  subtasks: Task[];

  @OneToMany(() => Comment, comment => comment.task)
  comments: Comment[];
}
