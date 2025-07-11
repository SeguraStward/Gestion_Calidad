import { DtoValidator } from '@core/common/dto-validator';
import { GenericService } from '@core/common/interfaces/generic.service';
import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '@src/prisma/prisma.service';
import { UserRole } from '@una-gc/database/prisma/generated/client';
import { UserRoleDto } from './dtos/user-role.dto';
import { EnrichedPermissions, RoleWithPermissions, SimpleUserPermission } from './types';
import { UserRolesRepository } from './user-roles.repository';

@Injectable()
export class UserRolesService extends GenericService<UserRole, UserRoleDto, UserRoleDto> {
  protected readonly logger = new Logger(UserRolesService.name);

  protected readonly relationCheckConfig = {
    relationFields: [''],
    errorMessage: 'Cannot delete UserRole because it has associated: none.',
  };

  constructor(
    protected readonly userRolesRepository: UserRolesRepository,
    protected readonly dtoValidator: DtoValidator,
    protected readonly prisma: PrismaService,
  ) {
    super(userRolesRepository, UserRoleDto);
  }

  // * CRUD methods are defined in the GenericService *

  /**
   * Retrieves active roles with their active permissions
   * @param roleId - The ID of the role to retrieve
   * @returns Array of user active roles with active permissions including permission details
   */
  async getRoleWithPermissions(roleId: string): Promise<RoleWithPermissions | null> {
    this.logger.log(`Getting active roles with permissions`);

    const role = await this.prisma.userRole.findFirst({
      where: { id: roleId },
    });

    if (!role) {
      this.logger.warn(`Role with id ${roleId} not found`);
      return null;
    }

    const permissionIds = role.permissions.map((perm) => perm.permissionID);

    const permissions = await this.prisma.userPermission.findMany({
      where: { id: { in: permissionIds } },
      select: { id: true, name: true, code: true, status: true },
    });

    const activePermissionMap = new Map(
      permissions.filter((p) => p.status === 'ACTIVE').map((p) => [p.id, p]),
    );

    const enrichedPermissions: EnrichedPermissions[] = role.permissions
      .filter((perm) => activePermissionMap.has(perm.permissionID))
      .map((perm) => {
        const details = activePermissionMap.get(perm.permissionID);
        return {
          id: details.id,
          name: details.name,
          code: details.code,
          status: details.status,
          type: perm.permissions,
          scope: perm.scope,
          actions: perm.actions,
        };
      });

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      status: role.status,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      createdBy: role.createdBy,
      updatedBy: role.updatedBy,
      permissions: enrichedPermissions,
    };
  }

  // get all permission
  async getAllPermissions(): Promise<SimpleUserPermission[]> {
    this.logger.log('Getting all permissions');

    const permissions = await this.prisma.userPermission.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true, code: true, status: true },
    });

    return permissions.map((p) => ({
      id: p.id,
      name: p.name,
      code: p.code,
      status: p.status,
      type: 'READ', // Default type, can be customized
      scope: 'GLOBAL', // Default scope, can be customized
      actions: [], // Default actions, can be customized
    }));
  }
}
