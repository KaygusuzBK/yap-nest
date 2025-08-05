import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Task } from './task.entity';
import { Comment } from './comment.entity';

export enum ProjectStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255 })
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'varchar',
    enum: Object.values(ProjectStatus),
    default: ProjectStatus.DRAFT
  })
  status: ProjectStatus;

  @Column('timestamp')
  startDate: Date;

  @Column('timestamp', { nullable: true })
  endDate: Date;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  budget: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  progress: number;

  @Column('uuid')
  ownerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Task, task => task.project)
  tasks: Task[];

  @OneToMany(() => Comment, comment => comment.project)
  comments: Comment[];
}
