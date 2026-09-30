import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const existing = await this.userModel
      .findOne({
        email: createUserDto.email.toLowerCase().trim(),
      })
      .exec();

    if (existing) {
      throw new ConflictException(
        'An account with this email address already exists. Please log in or use forgot password.',
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(createUserDto.password, salt);

    const user = new this.userModel({
      email: createUserDto.email.toLowerCase().trim(),
      passwordHash,
      name: createUserDto.name.trim(),
      avatar: createUserDto.avatar || null,
    });

    return user.save();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase().trim() })
      .exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    const updateData: Partial<User> = {};

    if (updateUserDto.name) {
      updateData.name = updateUserDto.name.trim();
    }
    if (updateUserDto.avatar !== undefined) {
      updateData.avatar = updateUserDto.avatar;
    }
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(updateUserDto.password, salt);
    }

    const updated = await this.userModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return updated;
  }

  async updateRefreshToken(
    id: string,
    refreshToken: string | null,
  ): Promise<void> {
    let hashedRefreshToken: string | null = null;
    if (refreshToken) {
      const salt = await bcrypt.genSalt(10);
      hashedRefreshToken = await bcrypt.hash(refreshToken, salt);
    }

    await this.userModel.findByIdAndUpdate(id, {
      $set: { hashedRefreshToken },
    });
  }

  async updatePasswordResetToken(
    id: string,
    tokenHash: string | null,
    expires: Date | null,
  ): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, {
      $set: {
        passwordResetTokenHash: tokenHash,
        passwordResetExpires: expires,
      },
    });
  }

  async findByPasswordResetToken(
    tokenHash: string,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        passwordResetTokenHash: tokenHash,
        passwordResetExpires: { $gt: new Date() },
      })
      .exec();
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await this.userModel.findByIdAndUpdate(id, {
      $set: {
        passwordHash,
        passwordResetTokenHash: null,
        passwordResetExpires: null,
        hashedRefreshToken: null, // Invalidate active sessions
      },
    });
  }

  async updateNotificationPreferences(
    id: string,
    dto: UpdateNotificationPreferencesDto,
  ): Promise<UserDocument> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedPreferences = {
      ...user.notificationPreferences,
      ...dto,
    };

    const updated = await this.userModel
      .findByIdAndUpdate(
        id,
        { $set: { notificationPreferences: updatedPreferences } },
        { new: true },
      )
      .exec();

    return updated!;
  }
}
