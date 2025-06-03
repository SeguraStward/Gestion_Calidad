import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { parseExpiryToMilliseconds } from './utils/expiry-parser.util';
import { RoleManagerService } from './role-manager.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly roleManagerService: RoleManagerService,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async googleLogin(googleUser: any) {
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
          fullLastName: googleUser.fullLastName || googleUser.familyName || '',
          googleId: googleUser.googleId,
          photoUrl: googleUser.picture,
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

    // Establecer rol activo inicial
    const userWithActiveRole = await this.roleManagerService.setInitialActiveRole(user.id);
    const accessToken = this.generateAccessToken(userWithActiveRole);
    const { rawRefreshToken } = await this.generateAndStoreRefreshToken(user.id);

    return {
      user: userWithActiveRole,
      token: accessToken,
      refreshToken: rawRefreshToken,
    };
  }

  generateAccessToken(userData: any): string {
    const payload = {
      sub: userData.id,
      email: userData.email,
      fullName: userData.fullName,
      fullLastName: userData.fullLastName,
      activeRole: userData.activeRole,
    };

    const accessTokenExpirationString = this.configService.get<string>('JWT_EXPIRATION') || '15m';
    const expiresIn = parseExpiryToMilliseconds(accessTokenExpirationString);

    this.logger.debug(`Generating access token with expiresIn: ${accessTokenExpirationString}`);

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: expiresIn,
    });
  }

  async refreshToken(userFromGuard: {
    id: string;
    email: string;
    fullName: string;
    fullLastName: string;
    refreshTokenDbId: string;
    activeRole?: any;
  }): Promise<{ token: string; refreshToken: string }> {
    const { id: userId, refreshTokenDbId } = userFromGuard;

    // Marcar el token anterior como usado
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

    // Generar nuevo token de acceso incluyendo el rol activo
    const newAccessToken = this.generateAccessToken(userFromGuard);

    // Generar y almacenar nuevo token de refresco
    const { rawRefreshToken: newRawRefreshToken } = await this.generateAndStoreRefreshToken(userId);

    return {
      token: newAccessToken,
      refreshToken: newRawRefreshToken,
    };
  }

  async generateAndStoreRefreshToken(userId: string): Promise<{ rawRefreshToken: string; expiresAt: Date }> {
    const refreshTokenExpirationString = this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d';
    const expiresInMilliseconds = parseExpiryToMilliseconds(refreshTokenExpirationString);
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
      // Para logout, normalmente es suficiente con logear el error
    }
  }

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
