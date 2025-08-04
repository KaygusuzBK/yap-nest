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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Local development için PostgreSQL kullan
        return {
          type: 'postgres',
          host: configService.get('DB_HOST') || 'localhost',
          port: parseInt(configService.get('DB_PORT') || '5432', 10),
          username: configService.get('DB_USERNAME') || 'kaygyusuzbk',
          password: configService.get('DB_PASSWORD') || '',
          database: configService.get('DB_DATABASE') || 'yap_nest',
          entities: [User, Project, Task],
          synchronize: false,
          dropSchema: true,
          logging: true,
          retryAttempts: 3,
          retryDelay: 3000,
          keepConnectionAlive: true,
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Project, Task]),
    AuthModule,
    ProjectsModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
