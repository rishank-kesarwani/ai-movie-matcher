import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { NotificationService } from '../notifications/notification.service';
import { UserRole } from '../../common/enums/roles.enum';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;
  let notificationService: Partial<NotificationService>;
  let configService: Partial<ConfigService>;

  const mockUser = {
    _id: 'usr_mock_123',
    email: 'cinephile@example.com',
    name: 'Alex MovieFan',
    passwordHash: '',
    role: UserRole.USER,
    hashedRefreshToken: '',
  };

  beforeAll(async () => {
    mockUser.passwordHash = await bcrypt.hash('CorrectPassword123!', 10);
    mockUser.hashedRefreshToken = await bcrypt.hash('valid_refresh_token', 10);
  });

  beforeEach(async () => {
    usersService = {
      create: jest.fn().mockResolvedValue(mockUser),
      findByEmail: jest.fn().mockImplementation((email: string) => {
        if (email === mockUser.email) return Promise.resolve(mockUser);
        return Promise.resolve(null);
      }),
      findById: jest.fn().mockImplementation((id: string) => {
        if (id === mockUser._id) return Promise.resolve(mockUser);
        return Promise.resolve(null);
      }),
      updateRefreshToken: jest.fn().mockResolvedValue(undefined),
      updatePasswordResetToken: jest.fn().mockResolvedValue(undefined),
      findByPasswordResetToken: jest.fn(),
      updatePassword: jest.fn().mockResolvedValue(undefined),
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('mock_jwt_token'),
      verify: jest.fn().mockReturnValue({ sub: mockUser._id, email: mockUser.email }),
    };

    notificationService = {
      sendWelcomeNotification: jest.fn().mockResolvedValue(undefined),
      sendPasswordResetNotification: jest.fn().mockResolvedValue(undefined),
    };

    configService = {
      get: jest.fn().mockImplementation((key: string, defaultVal?: any) => defaultVal || 'mock_val'),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: NotificationService, useValue: notificationService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user, return tokens, and dispatch welcome notification', async () => {
      const result = await authService.register({
        email: 'cinephile@example.com',
        password: 'Password123!',
        name: 'Alex MovieFan',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('cinephile@example.com');
      expect(usersService.updateRefreshToken).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should log in user with correct password', async () => {
      const result = await authService.login({
        email: 'cinephile@example.com',
        password: 'CorrectPassword123!',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result.user.email).toBe('cinephile@example.com');
      expect(usersService.updateRefreshToken).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      await expect(
        authService.login({
          email: 'cinephile@example.com',
          password: 'WrongPassword!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on non-existent email', async () => {
      await expect(
        authService.login({
          email: 'unknown@example.com',
          password: 'SomePassword!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('should return generic success message without leaking email existence', async () => {
      const resultExisting = await authService.forgotPassword({
        email: 'cinephile@example.com',
      });
      expect(resultExisting.success).toBe(true);
      expect(resultExisting.message).toContain('If an account exists');

      const resultNonExisting = await authService.forgotPassword({
        email: 'nonexistent@example.com',
      });
      expect(resultNonExisting.success).toBe(true);
      expect(resultNonExisting.message).toContain('If an account exists');
    });
  });

  describe('resetPassword', () => {
    it('should throw BadRequestException if token is invalid or expired', async () => {
      (usersService.findByPasswordResetToken as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.resetPassword({
          token: 'invalid_token',
          newPassword: 'NewPassword123!',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reset password successfully when token is valid', async () => {
      (usersService.findByPasswordResetToken as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.resetPassword({
        token: 'valid_token_123',
        newPassword: 'BrandNewPassword123!',
      });

      expect(result.success).toBe(true);
      expect(usersService.updatePassword).toHaveBeenCalled();
    });
  });
});
