import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment, CommentType } from '../entities/comment.entity';
import { User } from '../entities/user.entity';
import { Project } from '../entities/project.entity';
import { Task } from '../entities/task.entity';
import { CreateCommentDto, UpdateCommentDto } from '../dto/comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async create(createCommentDto: CreateCommentDto, userId: string): Promise<Comment> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const comment = this.commentRepository.create({
      ...createCommentDto,
      authorId: userId,
    });

    // Validate related entities exist
    if (createCommentDto.projectId) {
      const project = await this.projectRepository.findOne({ where: { id: createCommentDto.projectId } });
      if (!project) {
        throw new NotFoundException('Project not found');
      }
    }

    if (createCommentDto.taskId) {
      const task = await this.taskRepository.findOne({ where: { id: createCommentDto.taskId } });
      if (!task) {
        throw new NotFoundException('Task not found');
      }
    }

    if (createCommentDto.parentCommentId) {
      const parentComment = await this.commentRepository.findOne({ where: { id: createCommentDto.parentCommentId } });
      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }
    }

    return this.commentRepository.save(comment);
  }

  async findAll(query: { projectId?: string; taskId?: string; authorId?: string } = {}): Promise<Comment[]> {
    const queryBuilder = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .leftJoinAndSelect('comment.project', 'project')
      .leftJoinAndSelect('comment.task', 'task')
      .leftJoinAndSelect('comment.parentComment', 'parentComment')
      .orderBy('comment.createdAt', 'DESC');

    if (query.projectId) {
      queryBuilder.andWhere('comment.projectId = :projectId', { projectId: query.projectId });
    }

    if (query.taskId) {
      queryBuilder.andWhere('comment.taskId = :taskId', { taskId: query.taskId });
    }

    if (query.authorId) {
      queryBuilder.andWhere('comment.authorId = :authorId', { authorId: query.authorId });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['author', 'project', 'task', 'parentComment'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, userId: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if user is the author or admin
    if (comment.authorId !== userId) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user || user.role !== 'admin') {
        throw new ForbiddenException('You can only edit your own comments');
      }
    }

    Object.assign(comment, updateCommentDto);
    return this.commentRepository.save(comment);
  }

  async remove(id: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if user is the author or admin
    if (comment.authorId !== userId) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user || user.role !== 'admin') {
        throw new ForbiddenException('You can only delete your own comments');
      }
    }

    await this.commentRepository.remove(comment);
  }

  async getCommentStats(): Promise<{ total: number; byType: Record<CommentType, number> }> {
    const total = await this.commentRepository.count();
    
    const byType = await this.commentRepository
      .createQueryBuilder('comment')
      .select('comment.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('comment.type')
      .getRawMany();

    const stats = {
      total,
      byType: {
        [CommentType.TASK]: 0,
        [CommentType.PROJECT]: 0,
        [CommentType.GENERAL]: 0,
      },
    };

    byType.forEach((item) => {
      stats.byType[item.type] = parseInt(item.count);
    });

    return stats;
  }
} 