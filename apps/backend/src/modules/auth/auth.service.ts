import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

import { PrismaService } from '@src/prisma/prisma.service';
import {
  GoogleUser,
  AuthResult,
  UserFromRefreshToken,
  DatabaseUser,
  ProfileCompletionData,
  JwtPayload,
  RefreshTokenPayload,
} from './types';
import { parseExpiryToMilliseconds } from './utils/expiry-parser.util';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  protected readonly relationCheckConfig = {
    relationFields: [''],
    errorMessage: 'Cannot delete _entity_ because it has associated: _relation_.',
  };

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async googleLogin(googleUser: GoogleUser): Promise<AuthResult> {
    this.logger.log(`Google login attempt for: ${googleUser.email}`);

    // Validar datos mínimos requeridos
    if (!googleUser.email || !googleUser.googleId) {
      this.logger.error('Google user missing required fields:', {
        hasEmail: !!googleUser.email,
        hasGoogleId: !!googleUser.googleId,
      });
      throw new UnauthorizedException({
        message: 'Datos de Google incompletos. Intenta nuevamente.',
        code: 'INVALID_GOOGLE_DATA',
      });
    }

    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ googleId: googleUser.googleId }, { email: googleUser.email }],
      },
    });

    // If user doesn't exist, create with PRE_REGISTRATION status
    if (!user) {
      this.logger.log(`Creating new user with PRE_REGISTRATION status: ${googleUser.email}`);

      // Procesar nombre desde Google
      const fullName = googleUser.firstName || googleUser.email.split('@')[0];
      const fullLastName = googleUser.familyName || '';

      user = await this.prisma.user.create({
        data: {
          email: googleUser.email,
          googleId: googleUser.googleId,
          photoUrl: googleUser.picture || '',
          fullName: fullName,
          fullLastName: fullLastName,
          status: 'PRE_REGISTRATION', // Needs to complete profile
          roleIds: [],
        },
      });

      this.logger.log(`User created with PRE_REGISTRATION status: ${user.email}`);
    }

    // Check user status and handle accordingly
    switch (user.status) {
      case 'PRE_REGISTRATION':
        // User linked Google but needs to complete profile
        const accessToken = this.generateAccessToken(user.id, user.email);
        const { rawRefreshToken } = await this.generateAndStoreRefreshToken(user.id);

        return {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            fullLastName: user.fullLastName,
            profilePicture: user.photoUrl,
            status: user.status,
          },
          token: accessToken,
          refreshToken: rawRefreshToken,
          needsProfileCompletion: true,
        };

      case 'INACTIVE':
        throw new UnauthorizedException({
          message: 'Your account has been deactivated. Please contact the administrator.',
          code: 'ACCOUNT_INACTIVE',
        });

      case 'ACTIVE':
        // Update Google data if needed (mantener datos actualizados)
        let shouldUpdate = false;
        const updateData: any = {};

        if (!user.googleId) {
          updateData.googleId = googleUser.googleId;
          shouldUpdate = true;
        }

        if (googleUser.picture && user.photoUrl !== googleUser.picture) {
          updateData.photoUrl = googleUser.picture;
          shouldUpdate = true;
        }

        // Actualizar nombre si está vacío o si viene de Google y es diferente
        if (!user.fullName || (googleUser.firstName && user.fullName !== googleUser.firstName)) {
          updateData.fullName = googleUser.firstName || user.fullName || googleUser.email.split('@')[0];
          shouldUpdate = true;
        }

        if (googleUser.familyName && user.fullLastName !== googleUser.familyName) {
          updateData.fullLastName = googleUser.familyName;
          shouldUpdate = true;
        }

        if (shouldUpdate) {
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: updateData,
          });
          this.logger.log(`Updated user data for ${user.email}`);
        }

        // Generate tokens for active users
        const activeAccessToken = this.generateAccessToken(user.id, user.email);
        const { rawRefreshToken: activeRefreshToken } = await this.generateAndStoreRefreshToken(user.id);

        return {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            fullLastName: user.fullLastName,
            profilePicture: user.photoUrl,
            status: user.status,
          },
          token: activeAccessToken,
          refreshToken: activeRefreshToken,
          needsProfileCompletion: false,
        };

      default:
        throw new UnauthorizedException({
          message: 'Account status invalid. Please contact administrator.',
          code: 'INVALID_STATUS',
        });
    }
  }

  generateAccessToken(userId: string, email: string): string {
    const payload: JwtPayload = { sub: userId, email };
    const accessTokenExpirationString = this.configService.get<string>('JWT_EXPIRATION') || '1m';
    const expiresIn = parseExpiryToMilliseconds(accessTokenExpirationString);
    this.logger.debug(`Generating access token with expiresIn: ${accessTokenExpirationString}`);
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: expiresIn,
    });
    return token;
  }

  async generateAndStoreRefreshToken(userId: string): Promise<{ rawRefreshToken: string; expiresAt: Date }> {
    const refreshTokenExpirationString = this.configService.get<string>('JWT_REFRESH_EXPIRATION');
    const expiresInMilliseconds = parseExpiryToMilliseconds(refreshTokenExpirationString);
    const expiresAt = new Date(Date.now() + expiresInMilliseconds);

    const payload: RefreshTokenPayload = { sub: userId };
    const rawRefreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: refreshTokenExpirationString,
    });

    const hashedToken = this.hashToken(rawRefreshToken);

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: hashedToken,
        userId: userId,
        expiresAt: expiresAt,
      },
    });
    this.logger.log(`New refresh token stored for user ${userId}. Expires at: ${expiresAt.toISOString()}`);
    return { rawRefreshToken, expiresAt };
  }

  // userFromGuard is the object returned by JwtRefreshStrategy.validate
  async refreshToken(userFromGuard: UserFromRefreshToken): Promise<{ token: string; refreshToken: string }> {
    const { id: userId, email, refreshTokenDbId } = userFromGuard;

    try {
      await this.prisma.refreshToken.update({
        where: { id: refreshTokenDbId },
        data: { usedAt: new Date() },
      });
      this.logger.log(`Refresh token (DB ID: ${refreshTokenDbId}) marked as used for user ${userId}.`);
    } catch (error) {
      this.logger.error(
        `Failed to mark refresh token (DB ID: ${refreshTokenDbId}) as used for user ${userId}: ${error}`,
      );
      throw new UnauthorizedException('Error processing refresh token. Please try logging in again.');
    }

    const newAccessToken = this.generateAccessToken(userId, email);
    const { rawRefreshToken: newRawRefreshToken } = await this.generateAndStoreRefreshToken(userId);

    return {
      token: newAccessToken,
      refreshToken: newRawRefreshToken,
    };
  }

  async revokeRefreshToken(rawRefreshTokenFromCookie: string): Promise<void> {
    if (!rawRefreshTokenFromCookie) return;

    const hashedToken = this.hashToken(rawRefreshTokenFromCookie);
    try {
      const tokenRecord = await this.prisma.refreshToken.findUnique({
        where: { tokenHash: hashedToken },
      });

      if (tokenRecord) {
        if (tokenRecord.revokedAt || tokenRecord.usedAt) {
          this.logger.log(
            `Logout attempt for already revoked/used token (ID: ${tokenRecord.id}). No action needed.`,
          );
          return;
        }
        await this.prisma.refreshToken.update({
          where: { id: tokenRecord.id },
          data: { revokedAt: new Date() },
        });
        this.logger.log(`Refresh token (ID: ${tokenRecord.id}) revoked successfully on logout.`);
      } else {
        this.logger.warn(`Logout attempt with a refresh token not found in DB (hash: ${hashedToken}).`);
      }
    } catch (error) {
      this.logger.error(`Error revoking refresh token (hash: ${hashedToken}) on logout: ${error}`);
      // Decide if to throw or log. For logout, usually logging is sufficient.
    }
  }

  // validateToken (for access tokens) remains the same
  validateToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch {
      return null;
    }
  }

  /**
   * Get user by ID
   * @param userId - The ID of the user
   * @returns User data
   */
  async getUserById(userId: string): Promise<DatabaseUser> {
    this.logger.log(`Getting user by ID: ${userId}`);

    // Validar que el userId sea válido
    if (!userId || typeof userId !== 'string') {
      this.logger.error(`Invalid userId provided: ${userId}`);
      throw new UnauthorizedException('Invalid user ID');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        fullLastName: true,
        photoUrl: true,
        status: true,
      },
    });

    if (!user) {
      this.logger.error(`User not found with ID: ${userId}`);
      throw new UnauthorizedException('User not found');
    }

    if (user.status === 'INACTIVE') {
      this.logger.warn(`Attempt to access inactive user: ${userId}`);
      throw new UnauthorizedException('User account is inactive');
    }

    // Validar que tengamos datos básicos
    if (!user.email) {
      this.logger.error(`User ${userId} has incomplete data - missing email`);
      throw new UnauthorizedException('User data is incomplete');
    }

    // Asegurar que tenemos un nombre, usar email como fallback
    if (!user.fullName) {
      this.logger.warn(`User ${userId} has no fullName, using email prefix as fallback`);
    }

    return {
      ...user,
      fullName: user.fullName || user.email.split('@')[0],
    };
  }

  /**
   * Authenticate existing user (now removed as it's replaced by googleLogin)
   * @deprecated Use googleLogin instead
   */

  // Remove activate user and pending users methods as they're not needed
  // in the simplified flow where PRE_REGISTRATION means incomplete profile

  /**
   * Complete user profile (for PRE_REGISTRATION users)
   * @param userId - ID of the user completing profile
   * @param profileData - Profile completion data
   * @returns Updated user information
   */
  async completeUserProfile(userId: string, profileData: ProfileCompletionData) {
    this.logger.log(`Completing profile for user ${userId}`);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        status: true,
        fullName: true,
        fullLastName: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException({
        message: 'User not found.',
        code: 'USER_NOT_FOUND',
      });
    }

    if (user.status !== 'PRE_REGISTRATION') {
      throw new UnauthorizedException({
        message: 'Profile completion is only available for users in PRE_REGISTRATION status.',
        code: 'INVALID_USER_STATUS',
      });
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          fullName: profileData.fullName,
          fullLastName: profileData.fullLastName,
          status: 'ACTIVE', // User becomes active after completing profile
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Profile completed for user ${updatedUser.email}, status changed to ACTIVE`);

      return {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          fullName: updatedUser.fullName,
          fullLastName: updatedUser.fullLastName,
          profilePicture: updatedUser.photoUrl,
          status: updatedUser.status,
        },
        message: 'Profile completed successfully. You can now access the system.',
      };
    } catch (error) {
      this.logger.error(`Error completing profile for user ${userId}:`, error);
      throw new UnauthorizedException({
        message: 'Failed to complete profile. Please try again.',
        code: 'PROFILE_COMPLETION_FAILED',
      });
    }
  }

  async setActiveRole(userId: string, roleId: string): Promise<void> {
    // Verificar que el usuario tiene acceso a este rol
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          where: {
            id: roleId,
            status: 'ACTIVE',
          },
        },
      },
    });

    if (!user || user.roles.length === 0) {
      this.logger.warn(`User ${userId} attempted to set invalid role ${roleId}`);
      throw new UnauthorizedException('Invalid role selected or role not assigned to user');
    }

    const selectedRole = user.roles[0];
    this.logger.log(`User ${userId} set active role to ${roleId} (${selectedRole.name})`);
  }
}
