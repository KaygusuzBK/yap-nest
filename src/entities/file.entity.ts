import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Project } from './project.entity';
import { Task } from './task.entity';

@Entity('files')
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column()
  originalName: string;

  @Column()
  mimeType: string;

  @Column({ type: 'int' })
  size: number;

  @Column()
  url: string;

  @Column({ nullable: true })
  taskId?: string;

  @Column({ nullable: true })
  projectId?: string;

  @Column()
  uploadedById: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => Task, (task) => task.files, { nullable: true })
  @JoinColumn({ name: 'taskId' })
  task?: Task;

  @ManyToOne(() => Project, (project) => project.files, { nullable: true })
  @JoinColumn({ name: 'projectId' })
  project?: Project;

  @ManyToOne(() => User, (user) => user.uploadedFiles)
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy: User;
}
