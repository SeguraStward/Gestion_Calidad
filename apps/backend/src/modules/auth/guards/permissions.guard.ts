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
import { Permission } from '../types';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const disableRoles = process.env.DISABLED_ROLES === 'true';
    const disableAuth = process.env.DISABLED_AUTH === 'true';

    if (disableRoles || disableAuth) {
      this.logger.warn(`This guard is disabled, all requests will be allowed (DISABLED_ROLES=${disableRoles}, DISABLED_AUTH=${disableAuth})`);
      return true;
    }

    // Lista de recursos SINAES que tienen acceso libre
    const SINAES_RESOURCES = [
      'DIMENSION',
      'COMPONENT',
      'CRITERION',
      'STANDARD',
      'QUALITY_EVIDENCE',
      'PROOF_DOCUMENT',
      'PROOF_DOCUMENT_TYPE',
      'STANDARD_EVIDENCE',
      'CAREER_PROOF_DOCUMENT'
    ];

    // Verificar si el recurso es SINAES
    const resourceName = this.reflector.getAllAndOverride<string>(RESOURCE_NAME_KEY, [context.getClass()]);
    if (resourceName && SINAES_RESOURCES.includes(resourceName)) {
      this.logger.debug(`SINAES resource ${resourceName} allowed without permission check`);
      return true;
    }

    try {
      this.logger.debug('Starting permissions verification');

      const requiredPermissions = this.reflector.getAllAndOverride<RequiredPermission[]>(PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      if (!requiredPermissions || requiredPermissions.length === 0) {
        this.logger.debug('No permissions required for this endpoint');
        return true;
      }

      const request = context.switchToHttp().getRequest();
      const user = request.user;

      if (!user) {
        this.logger.warn('No user found in request');
        throw new ForbiddenException('User not authenticated');
      }

      const activeRoleId = request.cookies?.user_active_role_id;

      if (!activeRoleId) {
        this.logger.warn(`User ${user.id} without active role trying to access protected resource`);
        throw new ForbiddenException('Your role is not active or not selected');
      }

      const userRole = user.roles?.find((role: any) => role.id === activeRoleId);
      if (!userRole) {
        this.logger.warn(`User ${user.id} trying to use role ${activeRoleId} that doesn't belong to them`);
        throw new ForbiddenException('You do not have access to the selected role');
      }

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
        throw new ForbiddenException('Role not found or not active');
      }

      // IMPORTANTE: Si el rol es ADMINISTRADOR, permitir acceso total
      if (activeRole.name === 'ADMINISTRADOR') {
        this.logger.debug(`User ${user.email} has ADMINISTRADOR role - granting full access`);
        return true;
      }

      const resourceName = this.reflector.getAllAndOverride<string>(RESOURCE_NAME_KEY, [context.getClass()]);

      const processedPermissions = requiredPermissions.map((permission) => {
        if (permission.resource === RESOURCE_NAME_TOKEN) {
          if (!resourceName) {
            this.logger.error(`Resource name token used but no @ResourceName decorator found on controller`);
            throw new ForbiddenException('Permissions configuration error');
          }
          return {
            ...permission,
            resource: resourceName,
          };
        }
        return permission;
      });

      this.logger.debug(`Processed permissions: ${JSON.stringify(processedPermissions)}`);

      for (const requiredPermission of processedPermissions) {
        if (!requiredPermission.resource || !requiredPermission.action) {
          this.logger.error(
            `Invalid permission configuration: resource=${requiredPermission.resource}, action=${requiredPermission.action}`,
          );
          throw new ForbiddenException('Permissions configuration error');
        }

        this.logger.debug(
          `Checking permission for user ${user.email}: action=${requiredPermission.action}, resource=${requiredPermission.resource}`,
        );

        const hasPermission = await this.checkPermission(activeRole.permissions, requiredPermission);

        if (!hasPermission) {
          this.logger.warn(
            `Access denied for ${user.email}: Requires ${requiredPermission.action} on ${requiredPermission.resource}`,
          );
          throw new ForbiddenException(
            `You do not have permission to ${this.getActionLabel(requiredPermission.action)} this resource`,
          );
        }
      }

      this.logger.debug(`Permissions successfully verified for user ${user.email}`);
      return true;
    } catch (error: any) {
      this.logger.error('Error in PermissionsGuard', error.stack || error);
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new ForbiddenException('Error verifying permissions');
    }
  }

  private async checkPermission(
    rolePermissions: Permission[],
    requiredPermission: RequiredPermission,
  ): Promise<boolean> {
    try {
      if (!requiredPermission.resource || !requiredPermission.action) {
        this.logger.warn(
          `Invalid permission check: resource=${requiredPermission.resource}, action=${requiredPermission.action}`,
        );
        return false;
      }

      const permissionEntity = await this.prisma.userPermission.findUnique({
        where: {
          code: requiredPermission.resource,
          status: 'ACTIVE',
        },
        select: { id: true },
      });

      if (!permissionEntity) {
        this.logger.warn(`Permission not found in database or not active: ${requiredPermission.resource}`);
        return false;
      }

      const resourcePermission = rolePermissions?.find((p) => p.permissionID === permissionEntity.id);

      if (!resourcePermission) {
        this.logger.debug(`Role doesn't have permission: ${requiredPermission.resource}`);
        return false;
      }

      const hasActionType = resourcePermission.permissions.includes(requiredPermission.action);

      if (!hasActionType) {
        this.logger.debug(
          `Role doesn't have required action ${requiredPermission.action} for permission: ${requiredPermission.resource}`,
        );
        return false;
      }

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
      this.logger.error('Error in checkPermission', error.stack || error);
      return false;
    }
  }

  private getActionLabel(action: PermissionType): string {
    const labels = {
      [PermissionType.CREATE]: 'create',
      [PermissionType.READ]: 'view',
      [PermissionType.UPDATE]: 'update',
      [PermissionType.DELETE]: 'delete',
      [PermissionType.REPORT]: 'generate reports for',
    };
    return labels[action] || 'access';
  }
}
