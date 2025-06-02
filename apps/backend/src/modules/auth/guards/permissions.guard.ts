import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PrismaService } from '@src/prisma/prisma.service';
import { PermissionType } from '@una-gc/database/prisma/generated/client';

import { PERMISSIONS_KEY, RequiredPermission } from '../decorators/require-permissions.decorator';
import { RESOURCE_NAME_KEY } from '../decorators/resource-name.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // validar si en el env está habilitado el guard
    const disable = process.env.DISABLED_PERMISSIONS_GUARD === 'true';
    if (disable) {
      return true;
    }

    // Obtener los permisos requeridos para el endpoint
    const requiredPermissions = this.reflector.getAllAndOverride<RequiredPermission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no hay permisos requeridos, permitir acceso
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Verificar que el usuario tenga un rol activo
    if (!user || !user.activeRole) {
      this.logger.warn(`User without active role trying to access protected resource`);
      throw new ForbiddenException('Tu rol no está activo o no tienes un rol seleccionado');
    }

    // Obtener el nombre del recurso de los metadatos
    const resourceName = this.reflector.getAllAndOverride<string>(RESOURCE_NAME_KEY, [context.getClass()]);

    // Cargar permisos si no están incluidos
    let rolePermissions = user.activeRole.permissions;
    if (!rolePermissions) {
      const role = await this.prisma.userRole.findUnique({
        where: { id: user.activeRole.id },
        select: { permissions: true },
      });

      if (!role) {
        this.logger.warn(`Role not found: ${user.activeRole.id}`);
        throw new ForbiddenException('Rol no encontrado');
      }

      rolePermissions = role.permissions;
      // Actualizar el objeto user para futuras comprobaciones
      user.activeRole.permissions = rolePermissions;
    }

    // Verificar cada permiso requerido
    for (const requiredPermission of requiredPermissions) {
      // Reemplazar 'resourceName' con el valor real si existe
      const resource =
        requiredPermission.resource === 'resourceName' && resourceName
          ? resourceName
          : requiredPermission.resource;

      const permissionToCheck = {
        ...requiredPermission,
        resource,
      };

      const hasPermission = await this.checkPermission(rolePermissions, permissionToCheck);

      if (!hasPermission) {
        this.logger.warn(
          `Access denied for ${user.email}: Requires ${permissionToCheck.action} on ${permissionToCheck.resource}`,
        );
        throw new ForbiddenException(
          `No tienes permiso para ${this.getActionLabel(permissionToCheck.action)} este recurso`,
        );
      }
    }

    return true;
  }

  private async checkPermission(
    rolePermissions: any[],
    requiredPermission: RequiredPermission,
  ): Promise<boolean> {
    // Encontrar el ID del permiso basado en el código
    const permissionEntity = await this.prisma.userPermission.findUnique({
      where: { code: requiredPermission.resource },
      select: { id: true },
    });

    if (!permissionEntity) {
      this.logger.warn(`Permission not found in database: ${requiredPermission.resource}`);
      return false;
    }

    // Buscar el permiso en los permisos del rol usando el ID obtenido
    const resourcePermission = rolePermissions?.find((p) => p.permissionID === permissionEntity.id);

    if (!resourcePermission) {
      return false;
    }

    // Verificar si tiene el tipo de acción permitida
    const hasActionType = resourcePermission.permissions.includes(requiredPermission.action);

    // Verificar si tiene acciones específicas (si aplica)
    let hasSpecificAction = false;
    if (resourcePermission.actions && resourcePermission.actions.length > 0) {
      const actionName = requiredPermission.action.toLowerCase();
      hasSpecificAction = resourcePermission.actions.includes(actionName);
    }

    // Verificar el scope si se requiere
    let scopeMatches = true;
    if (requiredPermission.scope && resourcePermission.scope) {
      scopeMatches = resourcePermission.scope === requiredPermission.scope;
    }

    return (hasActionType || hasSpecificAction) && scopeMatches;
  }

  private getActionLabel(action: PermissionType): string {
    const labels = {
      [PermissionType.CREATE]: 'crear',
      [PermissionType.READ]: 'ver',
      [PermissionType.UPDATE]: 'actualizar',
      [PermissionType.DELETE]: 'eliminar',
    };
    return labels[action] || 'acceder a';
  }
}
