import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { NotificationService } from '../notifications/notification.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { AuthUser, JwtPayload } from '../../common/interfaces/auth-user.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly notificationService: NotificationService,
  ) {}

  async register(dto: RegisterDto) {
    this.logger.log(`Registering new user: ${dto.email}`);
    const user = await this.usersService.create(dto);
    const userId = (user as any)._id.toString();

    const tokens = await this.generateTokens({
      sub: userId,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    await this.usersService.updateRefreshToken(userId, tokens.refreshToken);

    // Send welcome notification asynchronously
    this.notificationService
      .sendWelcomeNotification({
        id: userId,
        email: user.email,
        name: user.name,
      })
      .catch((err) => {
        this.logger.warn(`Failed to dispatch welcome notification: ${err.message}`);
      });

    return {
      user: {
        id: userId,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const userId = (user as any)._id.toString();

    const tokens = await this.generateTokens({
      sub: userId,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Refresh token rotation: update stored hashed token
    await this.usersService.updateRefreshToken(userId, tokens.refreshToken);

    return {
      user: {
        id: userId,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      },
      ...tokens,
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(dto.refreshToken, {
        secret: this.configService.get<string>(
          'jwt.refreshSecret',
          'dev_jwt_refresh_secret_ai_movie_matcher_2026',
        ),
      });
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException('Refresh token is invalid or has been revoked');
    }

    const isRefreshTokenMatching = await bcrypt.compare(
      dto.refreshToken,
      user.hashedRefreshToken,
    );

    if (!isRefreshTokenMatching) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const userId = (user as any)._id.toString();

    // Generate new access and rotated refresh token
    const tokens = await this.generateTokens({
      sub: userId,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    await this.usersService.updateRefreshToken(userId, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { success: true, message: 'Logged out successfully' };
  }

  async getMe(authUser: AuthUser) {
    const user = await this.usersService.findById(authUser.userId);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    return {
      id: (user as any)._id.toString(),
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      notificationPreferences: user.notificationPreferences,
      createdAt: (user as any).createdAt,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);

    // Generic response returned regardless of user existence to avoid email enumeration
    const genericResponse = {
      success: true,
      message:
        'If an account exists with this email address, a password reset link has been sent.',
    };

    if (!user) {
      this.logger.log(
        `Forgot password requested for non-existent email: ${dto.email}`,
      );
      return genericResponse;
    }

    const userId = (user as any)._id.toString();
    const rawResetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawResetToken)
      .digest('hex');

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.usersService.updatePasswordResetToken(
      userId,
      tokenHash,
      expiresAt,
    );

    // Send reset email via Notification Service
    this.notificationService
      .sendPasswordResetNotification(
        { id: userId, email: user.email, name: user.name },
        rawResetToken,
      )
      .catch((err) => {
        this.logger.warn(
          `Failed to dispatch password reset notification: ${err.message}`,
        );
      });

    return genericResponse;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = crypto
      .createHash('sha256')
      .update(dto.token)
      .digest('hex');

    const user = await this.usersService.findByPasswordResetToken(tokenHash);

    if (!user) {
      throw new BadRequestException(
        'Password reset link is invalid or has expired. Please request a new one.',
      );
    }

    const userId = (user as any)._id.toString();
    await this.usersService.updatePassword(userId, dto.newPassword);

    return {
      success: true,
      message:
        'Password has been reset successfully. You can now log in with your new password.',
    };
  }

  private async generateTokens(payload: JwtPayload) {
    const accessSecret = this.configService.get<string>(
      'jwt.accessSecret',
      'dev_jwt_access_secret_ai_movie_matcher_2026',
    );
    const refreshSecret = this.configService.get<string>(
      'jwt.refreshSecret',
      'dev_jwt_refresh_secret_ai_movie_matcher_2026',
    );
    const accessExpiration = this.configService.get<string>(
      'jwt.accessExpiration',
      '15m',
    );
    const refreshExpiration = this.configService.get<string>(
      'jwt.refreshExpiration',
      '7d',
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: payload.sub,
          email: payload.email,
          name: payload.name,
          role: payload.role,
        },
        { secret: accessSecret, expiresIn: accessExpiration },
      ),
      this.jwtService.signAsync(
        { sub: payload.sub, email: payload.email },
        { secret: refreshSecret, expiresIn: refreshExpiration },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }
}
