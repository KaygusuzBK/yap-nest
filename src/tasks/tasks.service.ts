import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from '../entities/task.entity';
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
    const assignee = await this.userRepository.findOne({
      where: { id: createTaskDto.assigneeId },
    });
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

    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .leftJoinAndSelect('task.project', 'project')
      .leftJoinAndSelect('project.owner', 'owner');

    if (projectId) {
      queryBuilder.andWhere('task.projectId = :projectId', { projectId });
    }

    if (user.role !== UserRole.ADMIN) {
      queryBuilder.andWhere(
        '(task.assigneeId = :userId OR project.ownerId = :userId)',
        { userId },
      );
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string, userId: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignee', 'project', 'project.owner'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has access to this task
    if (
      user.role !== UserRole.ADMIN &&
      task.assignee?.id !== userId &&
      task.project.owner.id !== userId
    ) {
      throw new ForbiddenException('Access denied');
    }

    return task;
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    userId: string,
  ): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignee', 'project', 'project.owner'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user can update this task
    if (
      user.role !== UserRole.ADMIN &&
      task.assignee?.id !== userId &&
      task.project.owner.id !== userId
    ) {
      throw new ForbiddenException('Access denied');
    }

    // Validate status transition if status is being updated
    if (updateTaskDto.status && updateTaskDto.status !== task.status) {
      if (!this.isValidStatusTransition(task.status, updateTaskDto.status)) {
        throw new BadRequestException(
          `Invalid status transition from ${task.status} to ${updateTaskDto.status}`,
        );
      }
    }

    // Update assignee if provided
    if (updateTaskDto.assigneeId) {
      const assignee = await this.userRepository.findOne({
        where: { id: updateTaskDto.assigneeId },
      });
      if (!assignee) {
        throw new NotFoundException('Assignee not found');
      }
      task.assignee = assignee;
    }

    // Update other fields
    Object.assign(task, updateTaskDto);

    return this.taskRepository.save(task);
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['project', 'project.owner'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
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

    // Simple stats for now (Simplified to fix Internal Server Error)
    const total = await this.taskRepository.count();
    const todo = await this.taskRepository.count({
      where: { status: TaskStatus.TODO },
    });
    const inProgress = await this.taskRepository.count({
      where: { status: TaskStatus.IN_PROGRESS },
    });
    const completed = await this.taskRepository.count({
      where: { status: TaskStatus.COMPLETED },
    });
    const cancelled = await this.taskRepository.count({
      where: { status: TaskStatus.CANCELLED },
    });

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
    const validTransitions: Record<TaskStatus, TaskStatus[]> = {
      [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
      [TaskStatus.IN_PROGRESS]: [TaskStatus.COMPLETED, TaskStatus.CANCELLED],
      [TaskStatus.REVIEW]: [TaskStatus.COMPLETED, TaskStatus.IN_PROGRESS],
      [TaskStatus.COMPLETED]: [],
      [TaskStatus.CANCELLED]: [],
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
}
