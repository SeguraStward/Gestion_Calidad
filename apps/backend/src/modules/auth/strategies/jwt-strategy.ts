import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@src/prisma/prisma.service';
import { Request } from 'express';
import { UserStatus } from '@una-gc/database/prisma/generated/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.auth_token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    this.logger.debug(`Validating JWT payload: ${JSON.stringify(payload)}`);

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        fullName: true,
        fullLastName: true,
        status: true,
        roles: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!user) {
      this.logger.warn(`User with id ${payload.sub} not found during JWT validation`);
      throw new UnauthorizedException('User not found');
    }

    // Validar que el usuario esté activo
    if (user.status === UserStatus.INACTIVE) {
      this.logger.warn(`JWT validation failed: User ${user.email} has inactive status: ${user.status}`);
      throw new UnauthorizedException('Account is not active');
    }

    return {
      id: user.id,
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
      fullLastName: user.fullLastName,
      roles: user.roles,
    };
  }
}
