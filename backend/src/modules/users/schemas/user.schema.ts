import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../../../common/enums/roles.enum';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (doc, ret: any) => {
      delete ret.passwordHash;
      delete ret.hashedRefreshToken;
      delete ret.passwordResetTokenHash;
      delete ret.passwordResetExpires;
      delete ret.__v;
      return ret;
    },
  },
})
export class User {
  @Prop({ required: true, unique: true, index: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: null })
  avatar?: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.USER, index: true })
  role: UserRole;

  @Prop({ default: null })
  hashedRefreshToken?: string;

  @Prop({ default: null, index: true })
  passwordResetTokenHash?: string;

  @Prop({ default: null })
  passwordResetExpires?: Date;

  @Prop({
    type: Object,
    default: {
      emailNotifications: true,
      pushNotifications: true,
      weeklyDigest: true,
      movieReleases: true,
      recommendationAlerts: true,
    },
  })
  notificationPreferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    weeklyDigest: boolean;
    movieReleases: boolean;
    recommendationAlerts: boolean;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);

