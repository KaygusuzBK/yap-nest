import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User, UserRole } from '../entities/user.entity';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
  let service: AuthService;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: UserRole.MEMBER,
    };

    it('should register a new user successfully', async () => {
      const mockUser = {
        id: 'uuid-1',
        ...registerDto,
        password: 'hashedPassword',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockToken = 'jwt-token';

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.register(registerDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: registerDto.email,
        password: 'hashedPassword',
        name: registerDto.name,
        avatar: registerDto.avatar,
        role: registerDto.role,
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
      expect(result.user).toBeDefined();
      expect(result.token).toBe(mockToken);
      expect(result.tokenType).toBe('Bearer');
      expect(result.expiresIn).toBe(3600);
      expect(result.user.password).toBeUndefined();
    });

    it('should throw ConflictException if user already exists', async () => {
      const existingUser = { id: 'uuid-1', email: registerDto.email };
      mockUserRepository.findOne.mockResolvedValue(existingUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 'uuid-1',
        email: loginDto.email,
        password: 'hashedPassword',
        name: 'Test User',
        isActive: true,
        role: UserRole.MEMBER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockToken = 'jwt-token';

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(loginDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      }, { expiresIn: '1h' });
      expect(result.user).toBeDefined();
      expect(result.token).toBe(mockToken);
      expect(result.tokenType).toBe('Bearer');
      expect(result.expiresIn).toBe(3600);
      expect(result.user.password).toBeUndefined();
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const mockUser = {
        id: 'uuid-1',
        email: loginDto.email,
        password: 'hashedPassword',
        isActive: false,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const mockUser = {
        id: 'uuid-1',
        email: loginDto.email,
        password: 'wrongHashedPassword',
        isActive: true,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Mock bcrypt.compare to return false for invalid password
      const bcrypt = require('bcryptjs') as any;
      (bcrypt.compare as any).mockResolvedValueOnce(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateUser', () => {
    it('should return user if found', async () => {
      const userId = 'uuid-1';
      const mockUser = { id: userId, email: 'test@example.com' };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser(userId);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      const userId = 'uuid-999';
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser(userId);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toBeNull();
    });
  });
});
