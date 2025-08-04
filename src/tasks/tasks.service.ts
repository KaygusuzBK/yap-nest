import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus, TaskPriority } from '../entities/task.entity';
import { User, UserRole } from '../entities/user.entity';
import { Project } from '../entities/project.entity';
import { CreateTaskDto, UpdateTaskDto } from '../dto/task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    const assignee = await this.userRepository.findOne({ where: { id: createTaskDto.assigneeId } });
    if (!assignee) {
      throw new NotFoundException('Assignee not found');
    }

    const project = await this.projectRepository.findOne({ 
      where: { id: createTaskDto.projectId },
      relations: ['owner'],
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if user has access to the project
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // Temporarily allow all users to create tasks
    // if (user.role !== UserRole.ADMIN && project.owner.id !== userId) {
    //   throw new ForbiddenException('Access denied to this project');
    // }

    const task = this.taskRepository.create({
      ...createTaskDto,
      assignee,
      project,
    });

    return this.taskRepository.save(task);
  }

  async findAll(userId: string, projectId?: string): Promise<Task[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let whereClause: any = {};
    let relations = ['assignee', 'project', 'project.owner'];

    if (projectId) {
      // Check if user has access to the project
      const project = await this.projectRepository.findOne({
        where: { id: projectId },
        relations: ['owner'],
      });
      if (!project) {
        throw new NotFoundException('Project not found');
      }
      if (user.role !== UserRole.ADMIN && project.owner.id !== userId) {
        throw new ForbiddenException('Access denied to this project');
      }
      whereClause.project = { id: projectId };
    } else {
      // Filter tasks based on user role
      if (user.role === UserRole.ADMIN) {
        // Admin can see all tasks
      } else {
        // Others see tasks they're assigned to or tasks in their projects
        whereClause = [
          { assignee: { id: userId } },
          { project: { owner: { id: userId } } },
        ];
      }
    }

    return this.taskRepository.find({
      where: whereClause,
      relations,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Task> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignee', 'project', 'project.owner', 'parentTask'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if user has access to this task
    if (user.role !== UserRole.ADMIN && 
        task.assignee?.id !== userId && 
        task.project.owner.id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<Task> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignee', 'project', 'project.owner'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if user can update this task
    if (user.role !== UserRole.ADMIN && 
        task.assignee?.id !== userId && 
        task.project.owner.id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Validate status transition
    if (updateTaskDto.status && task.status !== updateTaskDto.status) {
      if (!this.isValidStatusTransition(task.status, updateTaskDto.status)) {
        throw new BadRequestException('Invalid status transition');
      }
    }

    // Update assignee if provided
    if (updateTaskDto.assigneeId) {
      const assignee = await this.userRepository.findOne({ where: { id: updateTaskDto.assigneeId } });
      if (!assignee) {
        throw new NotFoundException('Assignee not found');
      }
      task.assignee = assignee;
    }

    Object.assign(task, updateTaskDto);
    return this.taskRepository.save(task);
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignee', 'project', 'project.owner'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if user can delete this task
    if (user.role !== UserRole.ADMIN && task.project.owner.id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.taskRepository.remove(task);
    return { message: 'Task deleted successfully' };
  }

  async getTaskStats(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Simple stats for now
    const total = await this.taskRepository.count();
    const todo = await this.taskRepository.count({ where: { status: TaskStatus.TODO } });
    const inProgress = await this.taskRepository.count({ where: { status: TaskStatus.IN_PROGRESS } });
    const completed = await this.taskRepository.count({ where: { status: TaskStatus.COMPLETED } });
    const cancelled = await this.taskRepository.count({ where: { status: TaskStatus.CANCELLED } });

    return {
      total,
      todo,
      inProgress,
      completed,
      cancelled,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }

  private isValidStatusTransition(currentStatus: TaskStatus, newStatus: TaskStatus): boolean {
    const validTransitions = {
      [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
      [TaskStatus.IN_PROGRESS]: [TaskStatus.COMPLETED, TaskStatus.CANCELLED, TaskStatus.TODO],
      [TaskStatus.COMPLETED]: [TaskStatus.IN_PROGRESS],
      [TaskStatus.CANCELLED]: [TaskStatus.TODO],
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
} 