import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { AuthResponseDto, UserResponseDto } from '../dto/auth-response.dto';
import { UserRole } from '../entities/user.entity';

// Mock user data for development
const mockUsers: any[] = [
  {
    id: 'uuid-1',
    name: 'Ahmet Yılmaz',
    email: 'ahmet@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    avatar: 'https://example.com/avatar1.jpg',
    role: UserRole.ADMIN,
    isActive: true,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-03-20T14:30:00Z'),
  },
  {
    id: 'uuid-2',
    name: 'Ayşe Demir',
    email: 'ayse@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    avatar: 'https://example.com/avatar2.jpg',
    role: UserRole.MANAGER,
    isActive: true,
    createdAt: new Date('2024-01-20T09:00:00Z'),
    updatedAt: new Date('2024-03-19T16:45:00Z'),
  },
];

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, name, avatar, role } = registerDto;

    // Check if user already exists
    const existingUser = mockUsers.find(user => user.email === email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: `uuid-${Date.now()}`,
      email,
      password: hashedPassword,
      name,
      avatar: avatar || null,
      role: role || UserRole.MEMBER,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUsers.push(newUser);

    // Generate JWT token
    const payload = { sub: newUser.id, email: newUser.email };
    const token = this.jwtService.sign(payload);

    // Return user data without password
    const { password: _, ...userWithoutPassword } = newUser;
    return {
      user: userWithoutPassword as UserResponseDto,
      token,
      tokenType: 'Bearer',
      expiresIn: 3600, // 1 hour for registration
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password, rememberMe } = loginDto;

    // Find user by email
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token with expiration based on remember me
    const payload = { sub: user.id, email: user.email };
    const expiresIn = rememberMe ? '7d' : '1h'; // 7 days or 1 hour
    const token = this.jwtService.sign(payload, { expiresIn });

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword as UserResponseDto,
      token,
      tokenType: 'Bearer',
      expiresIn: rememberMe ? 604800 : 3600, // 7 days or 1 hour in seconds
    };
  }

  async refreshToken(userId: string): Promise<AuthResponseDto> {
    const user = mockUsers.find(u => u.id === userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid user');
    }

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword as UserResponseDto,
      token,
      tokenType: 'Bearer',
      expiresIn: 3600,
    };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return { message: 'If the email exists, a reset link has been sent' };
    }

    // Generate reset token (in real app, you'd send email)
    const resetToken = this.jwtService.sign(
      { sub: user.id, type: 'reset' },
      { expiresIn: '1h' }
    );

    // In production, send email with reset link
    console.log(`Reset token for ${email}: ${resetToken}`);

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.type !== 'reset') {
        throw new BadRequestException('Invalid token type');
      }

      const user = mockUsers.find(u => u.id === payload.sub);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.updatedAt = new Date();

      return { message: 'Password reset successfully' };
    } catch (error) {
      throw new BadRequestException('Invalid or expired reset token');
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    user.updatedAt = new Date();

    return { message: 'Password changed successfully' };
  }

  async validateUser(id: string): Promise<any> {
    return mockUsers.find(u => u.id === id);
  }

  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as UserResponseDto;
  }
}
