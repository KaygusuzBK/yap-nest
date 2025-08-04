import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from '../entities/project.entity';
import { User, UserRole } from '../entities/user.entity';
import { CreateProjectDto } from '../dto/project.dto';
import { UpdateProjectDto } from '../dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    createProjectDto: CreateProjectDto,
    userId: string,
  ): Promise<Project> {
    const owner = await this.userRepository.findOne({ where: { id: userId } });
    if (!owner) {
      throw new NotFoundException('User not found');
    }

    const project = this.projectRepository.create({
      ...createProjectDto,
      owner,
    });

    return this.projectRepository.save(project);
  }

  async findAll(userId: string): Promise<Project[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Admin can see all projects, others see only their own
    if (user.role === UserRole.ADMIN) {
      return this.projectRepository.find({
        relations: ['owner'],
        order: { createdAt: 'DESC' },
      });
    }

    return this.projectRepository.find({
      where: { owner: { id: userId } },
      relations: ['owner'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Project> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if user has access to this project
    if (user.role !== UserRole.ADMIN && project.owner.id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return project;
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    userId: string,
  ): Promise<Project> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if user can update this project
    if (user.role !== UserRole.ADMIN && project.owner.id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Validate status transition
    if (updateProjectDto.status && project.status !== updateProjectDto.status) {
      if (
        !this.isValidStatusTransition(project.status, updateProjectDto.status)
      ) {
        throw new BadRequestException('Invalid status transition');
      }
    }

    Object.assign(project, updateProjectDto);
    return this.projectRepository.save(project);
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if user can delete this project
    if (user.role !== UserRole.ADMIN && project.owner.id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.projectRepository.remove(project);
    return { message: 'Project deleted successfully' };
  }

  async getProjectStats(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const whereClause =
      user.role === UserRole.ADMIN ? {} : { owner: { id: userId } };

    const [total, active, completed, cancelled] = await Promise.all([
      this.projectRepository.count({ where: whereClause }),
      this.projectRepository.count({
        where: { ...whereClause, status: ProjectStatus.ACTIVE },
      }),
      this.projectRepository.count({
        where: { ...whereClause, status: ProjectStatus.COMPLETED },
      }),
      this.projectRepository.count({
        where: { ...whereClause, status: ProjectStatus.CANCELLED },
      }),
    ]);

    return {
      total,
      active,
      completed,
      cancelled,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }

  private isValidStatusTransition(
    currentStatus: ProjectStatus,
    newStatus: ProjectStatus,
  ): boolean {
    const validTransitions: Record<ProjectStatus, ProjectStatus[]> = {
      [ProjectStatus.ACTIVE]: [
        ProjectStatus.COMPLETED,
        ProjectStatus.CANCELLED,
        ProjectStatus.ON_HOLD,
      ],
      [ProjectStatus.ON_HOLD]: [ProjectStatus.ACTIVE, ProjectStatus.CANCELLED],
      [ProjectStatus.COMPLETED]: [],
      [ProjectStatus.CANCELLED]: [],
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
}
