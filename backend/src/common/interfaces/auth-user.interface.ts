import { UserRole } from '../enums/roles.enum';

export interface AuthUser {
  userId: string;
  email: string;
  name?: string;
  role: UserRole;
}

export interface JwtPayload {
  sub: string;
  email: string;
  name?: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
