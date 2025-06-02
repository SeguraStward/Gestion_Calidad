import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@src/prisma/prisma.service';
import { Request } from 'express';

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
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Verificar el rol activo si existe en el payload
    let activeRole = null;
    if (payload.activeRole) {
      // Verificar que el usuario tenga este rol
      const matchingRole = user.roles.find((role) => role.id === payload.activeRole.id);

      if (!matchingRole) {
        this.logger.warn(
          `User ${user.id} has an active role in token that doesn't belong to them: ${payload.activeRole.id}`,
        );
        // No lanzamos excepción porque queremos permitir que continúe sin rol activo
      } else {
        activeRole = payload.activeRole;
      }
    }

    return {
      id: user.id,
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
      fullLastName: user.fullLastName,
      activeRole: activeRole,
      roles: user.roles,
    };
  }
}
