import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsEnum, IsNotEmpty } from 'class-validator';
import { CommentType } from '../entities/comment.entity';

export class CreateCommentDto {
  @ApiProperty({ description: 'Comment content' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ 
    description: 'Comment type',
    enum: CommentType,
    default: CommentType.GENERAL
  })
  @IsOptional()
  @IsEnum(CommentType)
  type?: CommentType;

  @ApiPropertyOptional({ description: 'Project ID if comment is related to a project' })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional({ description: 'Task ID if comment is related to a task' })
  @IsOptional()
  @IsUUID()
  taskId?: string;

  @ApiPropertyOptional({ description: 'Parent comment ID for nested comments' })
  @IsOptional()
  @IsUUID()
  parentCommentId?: string;
}

export class UpdateCommentDto {
  @ApiPropertyOptional({ description: 'Comment content' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string;

  @ApiPropertyOptional({ 
    description: 'Comment type',
    enum: CommentType
  })
  @IsOptional()
  @IsEnum(CommentType)
  type?: CommentType;
}
