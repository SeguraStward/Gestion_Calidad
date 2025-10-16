// types and interfaces for authentication module

import { PermissionType, PermissionScope, UserStatus } from '@una-gc/database/prisma/generated/client';

export interface Permission {
  permissionID: string;
  permissions: PermissionType[];
  scope: PermissionScope | null;
  actions: string[];
}

export interface GoogleUser {
  googleId: string;
  email: string;
  firstName: string;
  familyName?: string;
  picture?: string | null;
  accessToken?: string; // Google OAuth access token
  refreshToken?: string; // Google OAuth refresh token
}

export interface UserBasicInfo {
  id: string;
  email: string;
  fullName: string;
  fullLastName?: string | null;
  photoUrl?: string | null;
  status: UserStatus;
}

export interface AuthResult {
  user: UserBasicInfo;
  token: string;
  refreshToken: string;
  needsProfileCompletion: boolean;
}

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: string;
  iat?: number;
  exp?: number;
}

export interface UserFromJwt {
  id: string;
  email: string;
}

export interface UserFromRefreshToken extends UserFromJwt {
  refreshTokenDbId: string;
  refreshTokenFromCookie: string;
}

export interface CookieConfig {
  domain?: string;
  httpOnly: boolean;
  secure: boolean;
  maxAge: number;
  sameSite: 'lax' | 'strict' | 'none';
  path: string;
}

export interface ProfileCompletionData {
  fullName: string;
  fullLastName: string;
  phoneNumber?: string;
}

export type TokenType = 'JWT_EXPIRATION' | 'JWT_REFRESH_EXPIRATION';

export type AuthErrorCode =
  | 'AUTH_001'
  | 'AUTH_002'
  | 'AUTH_003'
  | 'AUTH_004'
  | 'AUTH_005'
  | 'AUTH_006'
  | 'AUTH_007'
  | 'AUTH_008'
  | 'AUTH_009'
  | 'AUTH_010'
  | 'AUTH_011'
  | 'AUTH_012'
  | 'USER_NOT_FOUND'
  | 'ACCOUNT_INACTIVE'
  | 'ACCOUNT_PENDING'
  | 'INVALID_GOOGLE_DATA'
  | 'INVALID_STATUS'
  | 'PROFILE_COMPLETION_FAILED';
