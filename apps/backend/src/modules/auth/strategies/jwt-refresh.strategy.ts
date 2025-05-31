import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@src/prisma/prisma.service';
import { Request } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  private readonly logger = new Logger(JwtRefreshStrategy.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.refresh_token;
        },
      ]),
      ignoreExpiration: false, // passport-jwt handles JWT expiry check
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true, // Pass request to validate to access the token itself
    });
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async validate(req: Request, payload: any) {
    const refreshTokenFromCookie = req?.cookies?.refresh_token;
    if (!refreshTokenFromCookie) {
      throw new UnauthorizedException('Refresh token not found in request cookie.');
    }

    const hashedToken = this.hashToken(refreshTokenFromCookie);

    const dbRefreshToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hashedToken },
    });

    if (!dbRefreshToken) {
      this.logger.warn(
        `Refresh token (hash: ${hashedToken}) not found in DB. User ID from payload: ${payload.sub}`,
      );
      // To prevent enumerating valid user IDs, we don't invalidate family here if token is unknown.
      throw new UnauthorizedException('Invalid refresh token.');
    }

    if (dbRefreshToken.userId !== payload.sub) {
      this.logger.error(
        `Refresh token (ID: ${dbRefreshToken.id}) owner mismatch. DB UserID: ${dbRefreshToken.userId}, Payload UserID: ${payload.sub}.`,
      );
      // This is a severe issue. Invalidate tokens for the user ID in the token's DB record.
      await this.invalidateTokenFamily(dbRefreshToken.userId, 'Token owner mismatch security event.');
      throw new UnauthorizedException('Refresh token mismatch. Session terminated.');
    }

    if (dbRefreshToken.revokedAt || dbRefreshToken.usedAt) {
      this.logger.warn(
        `Attempt to use a revoked/used refresh token (ID: ${dbRefreshToken.id}) by user ${payload.sub}. Invalidating all tokens for this user.`,
      );
      await this.invalidateTokenFamily(payload.sub, 'Attempted reuse of revoked/used token.');
      throw new UnauthorizedException(
        'Refresh token has been used or revoked. All active sessions for this user have been terminated.',
      );
    }

    if (new Date() > new Date(dbRefreshToken.expiresAt)) {
      this.logger.warn(
        `Refresh token (ID: ${dbRefreshToken.id}) has expired (checked from DB). User: ${payload.sub}`,
      );
      // Mark as revoked if expired but not yet marked.
      await this.prisma.refreshToken.update({
        where: { id: dbRefreshToken.id },
        data: { revokedAt: new Date() }, // Or usedAt, depending on policy
      });
      throw new UnauthorizedException('Refresh token has expired.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true /* Add other necessary fields */ },
    });

    if (!user) {
      throw new UnauthorizedException('User not found for refresh token payload.');
    }

    // Attach necessary info for the AuthService to use for marking token as used.
    return { ...user, refreshTokenFromCookie, refreshTokenDbId: dbRefreshToken.id };
  }

  private async invalidateTokenFamily(userId: string, reason: string): Promise<void> {
    this.logger.log(`Invalidating token family for user ${userId} due to: ${reason}`);
    await this.prisma.refreshToken.updateMany({
      where: {
        userId: userId,
        revokedAt: null,
        usedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }
}
