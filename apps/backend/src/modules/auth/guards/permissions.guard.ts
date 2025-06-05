import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PrismaService } from '@src/prisma/prisma.service';
import { PermissionType } from '@una-gc/database/prisma/generated/client';

import {
  PERMISSIONS_KEY,
  RequiredPermission,
  RESOURCE_NAME_TOKEN,
} from '../decorators/require-permissions.decorator';
import { RESOURCE_NAME_KEY } from '../decorators/resource-name.decorator';
import { Permission } from '../interfaces';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      this.logger.debug('Iniciando verificación de permisos');

      // validar si en el env está habilitado el guard
      const disable = process.env.DISABLED_ROLES == 'true';
      if (disable) {
        this.logger.warn('This guard is disabled, all requests will be allowed (DISABLED_ROLES=true)');
        return true;
      }

      // Obtener los permisos requeridos para el endpoint
      const requiredPermissions = this.reflector.getAllAndOverride<RequiredPermission[]>(PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      // Si no hay permisos requeridos, permitir acceso
      if (!requiredPermissions || requiredPermissions.length === 0) {
        this.logger.debug('No se requieren permisos para este endpoint');
        return true;
      }

      const request = context.switchToHttp().getRequest();
      const user = request.user;

      // Verificar que el usuario exista
      if (!user) {
        this.logger.warn('No user found in request');
        throw new ForbiddenException('Usuario no autenticado');
      }

      // Obtener el ID del rol activo desde la cookie
      const activeRoleId = request.cookies?.active_role_id;

      if (!activeRoleId) {
        this.logger.warn(`User ${user.id} without active role trying to access protected resource`);
        throw new ForbiddenException('Tu rol no está activo o no tienes un rol seleccionado');
      }

      // Verificar que el usuario tenga acceso a este rol
      const userRole = user.roles?.find((role: any) => role.id === activeRoleId);
      if (!userRole) {
        this.logger.warn(`User ${user.id} trying to use role ${activeRoleId} that doesn't belong to them`);
        throw new ForbiddenException('No tienes acceso al rol seleccionado');
      }

      // Cargar el rol completo con permisos desde la base de datos
      const activeRole = await this.prisma.userRole.findUnique({
        where: {
          id: activeRoleId,
          status: 'ACTIVE',
        },
        select: {
          id: true,
          name: true,
          description: true,
          permissions: true,
        },
      });

      if (!activeRole) {
        this.logger.error(`Active role not found or not active: ${activeRoleId}`);
        throw new ForbiddenException('Rol no encontrado o no está activo');
      }

      // Obtener el nombre del recurso de los metadatos del controlador
      const resourceName = this.reflector.getAllAndOverride<string>(RESOURCE_NAME_KEY, [context.getClass()]);

      // Procesar permisos requeridos y reemplazar tokens especiales
      const processedPermissions = requiredPermissions.map((permission) => {
        if (permission.resource === RESOURCE_NAME_TOKEN) {
          if (!resourceName) {
            this.logger.error(`Resource name token used but no @ResourceName decorator found on controller`);
            throw new ForbiddenException('Error de configuración de permisos');
          }
          return {
            ...permission,
            resource: resourceName,
          };
        }
        return permission;
      });

      this.logger.debug(`Processed permissions: ${JSON.stringify(processedPermissions)}`);

      // Verificar cada permiso requerido
      for (const requiredPermission of processedPermissions) {
        // Verificar que el permiso requerido tenga los campos necesarios
        if (!requiredPermission.resource || !requiredPermission.action) {
          this.logger.error(
            `Invalid permission configuration: resource=${requiredPermission.resource}, action=${requiredPermission.action}`,
          );
          throw new ForbiddenException('Error de configuración de permisos');
        }

        this.logger.debug(
          `Verificando permiso para usuario ${user.email}: acción=${requiredPermission.action}, recurso=${requiredPermission.resource}`,
        );

        const hasPermission = await this.checkPermission(activeRole.permissions, requiredPermission);

        if (!hasPermission) {
          this.logger.warn(
            `Access denied for ${user.email}: Requires ${requiredPermission.action} on ${requiredPermission.resource}`,
          );
          throw new ForbiddenException(
            `No tienes permiso para ${this.getActionLabel(requiredPermission.action)} este recurso`,
          );
        }
      }

      this.logger.debug(`Permisos verificados correctamente para usuario ${user.email}`);
      return true;
    } catch (error: any) {
      this.logger.error('Error en PermissionsGuard', error.stack || error);
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new ForbiddenException('Error al verificar permisos');
    }
  }

  private async checkPermission(
    rolePermissions: Permission[],
    requiredPermission: RequiredPermission,
  ): Promise<boolean> {
    try {
      // Validar que los parámetros requeridos no sean undefined
      if (!requiredPermission.resource || !requiredPermission.action) {
        this.logger.warn(
          `Invalid permission check: resource=${requiredPermission.resource}, action=${requiredPermission.action}`,
        );
        return false;
      }

      // 1. Encontrar el ID del permiso basado en el código
      const permissionEntity = await this.prisma.userPermission.findUnique({
        where: {
          code: requiredPermission.resource,
          status: 'ACTIVE', // Asegurarse que el permiso esté activo
        },
        select: { id: true },
      });

      if (!permissionEntity) {
        this.logger.warn(`Permission not found in database or not active: ${requiredPermission.resource}`);
        return false;
      }

      // 2. Buscar el permiso en los permisos del rol usando el ID obtenido
      const resourcePermission = rolePermissions?.find((p) => p.permissionID === permissionEntity.id);

      if (!resourcePermission) {
        this.logger.debug(`Role doesn't have permission: ${requiredPermission.resource}`);
        return false;
      }

      // 3. Verificar si tiene el tipo de acción permitida
      const hasActionType = resourcePermission.permissions.includes(requiredPermission.action);

      if (!hasActionType) {
        this.logger.debug(
          `Role doesn't have required action ${requiredPermission.action} for permission: ${requiredPermission.resource}`,
        );
        return false;
      }

      // 4. Verificar el scope si se requiere
      if (requiredPermission.scope && resourcePermission.scope) {
        const scopeMatches = resourcePermission.scope === requiredPermission.scope;
        if (!scopeMatches) {
          this.logger.debug(
            `Role doesn't have required scope ${requiredPermission.scope} for permission: ${requiredPermission.resource}`,
          );
          return false;
        }
      }

      return true;
    } catch (error: any) {
      this.logger.error('Error en checkPermission', error.stack || error);
      return false;
    }
  }

  private getActionLabel(action: PermissionType): string {
    const labels = {
      [PermissionType.CREATE]: 'crear',
      [PermissionType.READ]: 'ver',
      [PermissionType.UPDATE]: 'actualizar',
      [PermissionType.DELETE]: 'eliminar',
      [PermissionType.REPORT]: 'generar reportes de',
    };
    return labels[action] || 'acceder a';
  }
}
