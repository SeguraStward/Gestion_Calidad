import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';

/**
 * Guard para el portal del profesor.
 * No usa JWT. Valida que el header x-professor-token corresponda a un token
 * ACTIVE en la tabla ProfessorPortalToken y que la cédula en el header coincida.
 *
 * Headers requeridos:
 *   x-professor-token: <uuid del token>
 *   x-professor-cedula: <cédula del profesor>
 */
@Injectable()
export class ProfessorPortalGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['x-professor-token'];
    const cedula = request.headers['x-professor-cedula'];

    if (!token || !cedula) {
      throw new UnauthorizedException('Se requiere x-professor-token y x-professor-cedula');
    }

    const portalToken = await this.prisma.professorPortalToken.findUnique({
      where: { token },
    });

    if (!portalToken) {
      throw new UnauthorizedException('Token inválido');
    }

    if (portalToken.status !== 'ACTIVE') {
      throw new UnauthorizedException('Token expirado o ya utilizado');
    }

    if (portalToken.cedula !== cedula) {
      throw new UnauthorizedException('Cédula no coincide con el token');
    }

    if (new Date() > portalToken.expiresAt) {
      // Marcar como expirado automáticamente
      await this.prisma.professorPortalToken.update({
        where: { token },
        data: { status: 'EXPIRED' },
      });
      throw new UnauthorizedException('Token expirado');
    }

    // Adjuntar info del token al request para uso en el controller
    request.portalToken = portalToken;
    return true;
  }
}
