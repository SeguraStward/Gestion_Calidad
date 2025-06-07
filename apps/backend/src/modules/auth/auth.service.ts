import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { $Enums } from '@una-gc/database/prisma/generated/client';

export interface Permission {
  permissionID: string;
  permissions: $Enums.PermissionType[];
  scope: $Enums.PermissionScope | null;
  actions: string[];
}

interface GoogleUser {
  googleId: string;
  email: string;
  firstName: string;
  fullLastName?: string;
  familyName?: string;
  picture?: string;
}

export interface SelectedRole {
  id: string;
  name: string;
  description?: string | null;
  permissions: Permission[];
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private parseExpiryToMilliseconds(expiryString: string): number {
    const unit = expiryString.slice(-1);
    const value = parseInt(expiryString.slice(0, -1), 10);
    if (isNaN(value)) {
      this.logger.error(`Invalid expiry string format: ${expiryString}`);
      throw new Error('Invalid expiry string format');
    }
    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        this.logger.error(`Invalid expiry unit: ${unit} in ${expiryString}`);
        throw new Error('Invalid expiry unit');
    }
  }

  async googleLogin(googleUser: GoogleUser) {
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ googleId: googleUser.googleId }, { email: googleUser.email }],
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: googleUser.email,
          fullName: googleUser.firstName,
          fullLastName: googleUser.fullLastName || googleUser.familyName || '', // Ensure fullLastName is handled
          googleId: googleUser.googleId,
          photoUrl: googleUser.picture,
          // Ensure other required User fields are handled or have defaults
        },
      });
    } else if (!user.googleId && googleUser.googleId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleUser.googleId,
          ...(user.photoUrl ? {} : { photoUrl: googleUser.picture }),
        },
      });
    }

    const accessToken = this.generateAccessToken(user.id, user.email);
    const { rawRefreshToken } = await this.generateAndStoreRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        fullLastName: user.fullLastName,
        profilePicture: user.photoUrl,
      },
      token: accessToken,
      refreshToken: rawRefreshToken,
    };
  }

  generateAccessToken(userId: string, email: string): string {
    // Remover el parámetro role del JWT
    const payload = { sub: userId, email };
    const accessTokenExpirationString = this.configService.get<string>('JWT_EXPIRATION') || '1m';
    const expiresIn = this.parseExpiryToMilliseconds(accessTokenExpirationString);
    this.logger.debug(`Generating access token with expiresIn: ${accessTokenExpirationString}`);
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: expiresIn,
    });
    return token;
  }

  async generateAndStoreRefreshToken(userId: string): Promise<{ rawRefreshToken: string; expiresAt: Date }> {
    const refreshTokenExpirationString = this.configService.get<string>('JWT_REFRESH_EXPIRATION');
    const expiresInMilliseconds = this.parseExpiryToMilliseconds(refreshTokenExpirationString);
    const expiresAt = new Date(Date.now() + expiresInMilliseconds);

    const payload = { sub: userId };
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
  async refreshToken(userFromGuard: {
    id: string;
    email: string;
    refreshTokenDbId: string;
    refreshTokenFromCookie: string;
  }): Promise<{ token: string; refreshToken: string }> {
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

    // Generar nuevo access token sin rol
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
}
