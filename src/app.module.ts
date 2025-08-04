import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { User } from './entities/user.entity';
import { Project } from './entities/project.entity';
import { Task } from './entities/task.entity';
import { Comment } from './entities/comment.entity';
import { File } from './entities/file.entity';
import { Notification } from './entities/notification.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';
        
        if (isProduction) {
          // Production'da SQLite kullan
          return {
            type: 'sqlite',
            database: '/tmp/database.sqlite',
            entities: [User, Project, Task, Comment, File, Notification],
            synchronize: true,
            logging: false,
          };
        } else {
          // Development'da PostgreSQL kullan
          return {
            type: 'postgres',
            host: configService.get('DB_HOST') || 'localhost',
            port: parseInt(configService.get('DB_PORT') || '5432', 10),
            username: configService.get('DB_USERNAME') || 'postgres',
            password: configService.get('DB_PASSWORD') || '',
            database: configService.get('DB_DATABASE') || 'yap_nest',
            entities: [User, Project, Task, Comment, File, Notification],
            synchronize: configService.get('NODE_ENV') !== 'production',
            logging: configService.get('NODE_ENV') !== 'production',
            retryAttempts: 3,
            retryDelay: 3000,
            keepConnectionAlive: true,
          };
        }
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Project, Task, Comment, File, Notification]),
    AuthModule,
    ProjectsModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
