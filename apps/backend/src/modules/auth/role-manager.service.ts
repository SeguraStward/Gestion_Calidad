import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { parseExpiryToMilliseconds } from './utils/expiry-parser.util';

@Injectable()
export class RoleManagerService {
  private readonly logger = new Logger(RoleManagerService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async getUserAvailableRoles(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
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
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return user.roles;
  }

  async switchUserRole(userId: string, roleId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        fullLastName: true,
        roles: {
          where: { status: 'ACTIVE', id: roleId },
          select: {
            id: true,
            name: true,
            description: true,
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      this.logger.warn(`User not found during role switch: ${userId}`);
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const selectedRole = user.roles[0]; // Ya filtrado por Prisma

    if (!selectedRole) {
      this.logger.warn(
        `User ${userId} tried to switch to role ${roleId} which doesn't exist or isn't active`,
      );
      throw new UnauthorizedException('No tienes acceso a este rol, el rol no existe o no está activo');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
      fullLastName: user.fullLastName,
      activeRole: selectedRole,
    };

    const accessTokenExpirationString = this.configService.get<string>('JWT_EXPIRATION') || '15m';
    const expiresIn = parseExpiryToMilliseconds(accessTokenExpirationString);
    const secret = this.configService.get<string>('JWT_SECRET');

    if (!secret) {
      this.logger.error('JWT_SECRET not configured');
      throw new Error('Error de configuración interna del servidor');
    }

    const token = this.jwtService.sign(payload, {
      secret: secret,
      expiresIn: expiresIn,
    });

    return { token };
  }

  async setInitialActiveRole(userId: string) {
    try {
      // Buscar datos del usuario con su primer rol activo
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          fullName: true,
          fullLastName: true,
          photoUrl: true,
          roles: {
            where: { status: 'ACTIVE' },
            select: {
              id: true,
              name: true,
              description: true,
              permissions: true,
            },
            take: 1,
          },
        },
      });

      if (!user) {
        this.logger.warn(`User ${userId} not found when setting initial role`);
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // Crear objeto de usuario con información completa
      const userData = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        fullLastName: user.fullLastName,
        profilePicture: user.photoUrl,
        activeRole: user.roles.length > 0 ? user.roles[0] : null,
        roles: user.roles,
      };

      return userData;
    } catch (error) {
      this.logger.error(`Error setting initial role: ${(error as any).message}`);
      throw error; // Propagar el error para manejarlo apropiadamente
    }
  }
}
