import { Injectable, Logger, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../auth.service';

/**
 * Middleware para validar que el usuario autenticado tenga datos básicos completos
 * Este middleware se ejecuta después de la autenticación JWT para asegurar
 * que el usuario tenga los datos mínimos requeridos
 */
@Injectable()
export class UserDataValidationMiddleware implements NestMiddleware {
  private readonly logger = new Logger(UserDataValidationMiddleware.name);

  constructor(private readonly authService: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Solo aplicar validación si hay usuario autenticado
    if (req.user) {
      const jwtUser = req.user as { id: string; email: string };

      try {
        // Verificar que el usuario existe y tiene datos básicos
        const user = await this.authService.getUserById(jwtUser.id);

        if (!user.id || !user.email) {
          this.logger.error(`User ${jwtUser.id} has incomplete basic data`);
          throw new UnauthorizedException('User data is incomplete');
        }

        // Agregar información del usuario validado al request
        req.user = {
          ...jwtUser,
          validated: true,
          userData: user,
        };
      } catch (error) {
        this.logger.error(`Error validating user data for ${jwtUser.id}:`, error);
        throw new UnauthorizedException('User validation failed');
      }
    }

    next();
  }
}
