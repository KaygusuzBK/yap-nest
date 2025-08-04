import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    // Production'da test kullanıcısı oluştur
    if (process.env.NODE_ENV === 'production') {
      await this.createTestUser();
    }
  }

  private async createTestUser() {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email: 'test@example.com' },
      });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        const testUser = this.userRepository.create({
          name: 'Test User',
          email: 'test@example.com',
          password: hashedPassword,
          role: UserRole.ADMIN,
          isActive: true,
        });

        await this.userRepository.save(testUser);
        console.log('Test user created successfully');
      }
    } catch (error) {
      console.log('Test user creation failed:', error.message);
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
