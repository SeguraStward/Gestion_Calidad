import { Injectable, Logger } from '@nestjs/common';
import { User, UserStatus } from '@una-gc/database/prisma/generated/client';

import { DtoValidator } from '@core/common/dto-validator';
import { GenericService } from '@core/common/interfaces/generic.service';

import { UsersRepository } from './users.repository';

import { UpdateUserDto } from './dtos/update-user.dto';
import { UserDto } from './dtos/user.dto';

import { PaginatedResponse } from '@src/core/http/interfaces/paginated-response.interface';
import { PrismaService } from '@src/prisma/prisma.service';
import { SimpleRoleWithPermissions, SimpleUserRole } from './types';

@Injectable()
export class UsersService extends GenericService<User, UserDto, UserDto, UpdateUserDto> {
  protected readonly logger = new Logger(UsersService.name);

  protected readonly relationCheckConfig = {
    relationFields: ['roles', 'academicLoads', 'finalWorks'],
    errorMessage: 'Cannot delete User because it has associated records.',
  };

  constructor(
    protected readonly usersRepository: UsersRepository,
    protected readonly dtoValidator: DtoValidator,
    protected readonly prisma: PrismaService,
  ) {
    super(usersRepository, UserDto);
  }

  // * CRUD methods are defined in the GenericService *

  // * specific methods for user*

  async updateProfile(userId: string, updateUserDto: UpdateUserDto): Promise<UserDto> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
      include: {
        roles: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            permissions: {
              select: {
                permissionID: true,
                permissions: true,
                scope: true,
                actions: true,
              },
            },
          },
        },
      },
    });
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    return user;
  }

  async getUserActiveRolesWithPermissions(userId: string): Promise<SimpleRoleWithPermissions[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        roles: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            permissions: {
              select: {
                permissionID: true,
                permissions: true,
                scope: true,
                actions: true,
              },
            },
          },
        },
      },
    });

    if (!user?.roles?.length) {
      return [];
    }

    const permissionIds = Array.from(
      new Set(user.roles.flatMap((role) => role.permissions?.map((p: any) => p.permissionID) || [])),
    );

    if (!permissionIds.length) {
      return user.roles.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description || '',
        status: role.status,
        permissions: [],
      }));
    }

    const permissionMap = await this.getActivePermissionsByIds(permissionIds);
    return this.mapRolesWithPermissions(user.roles, permissionMap);
  }

  async findUsersByRoleNameAndStatus(
    roleName: string,
    userStatus = 'ACTIVE',
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<UserDto>> {
    const where = {
      status: userStatus as any,
      roles: { some: { name: roleName, status: 'ACTIVE' } },
    };

    const include = {
      roles: {
        where: { status: 'ACTIVE' },
        select: { id: true, name: true, description: true, status: true },
      },
    };

    return this.findAll(page, limit, where, { createdAt: 'desc' }, include);
  }

  // get roles
  async getAllRoles(): Promise<SimpleUserRole[]> {
    const roles = await this.prisma.userRole.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
      },
    });

    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      status: role.status,
    }));
  }

  /**
   * Set user roles (override existing roles with new ones)
   * @param userId - The user ID
   * @param roleIds - Array of role IDs to assign to the user
   */
  async setUserRoles(userId: string, roleIds: string[]): Promise<UserDto> {
    // Validate that all role IDs exist and are active
    if (roleIds.length > 0) {
      const existingRoles = await this.prisma.userRole.findMany({
        where: {
          id: { in: roleIds },
          status: 'ACTIVE',
        },
        select: { id: true },
      });

      const existingRoleIds = existingRoles.map((role) => role.id);
      const missingRoleIds = roleIds.filter((roleId) => !existingRoleIds.includes(roleId));

      if (missingRoleIds.length > 0) {
        throw new Error(
          `The following role IDs do not exist or are not active: ${missingRoleIds.join(', ')}`,
        );
      }
    }

    // Update user with new roles (this will override existing roles)
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          set: roleIds.map((roleId) => ({ id: roleId })),
        },
      },
      include: {
        roles: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            permissions: {
              select: {
                permissionID: true,
                permissions: true,
                scope: true,
                actions: true,
              },
            },
          },
        },
      },
    });

    if (!updatedUser) {
      throw new Error(`User with ID ${userId} not found`);
    }

    return updatedUser;
  }

  /**
   * Change user status
   * @param userId - The user ID
   * @param status - The new status to set
   */
  async changeUserStatus(userId: string, status: UserStatus): Promise<UserDto> {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { status },
      include: {
        roles: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            permissions: {
              select: {
                permissionID: true,
                permissions: true,
                scope: true,
                actions: true,
              },
            },
          },
        },
      },
    });

    if (!updatedUser) {
      throw new Error(`User with ID ${userId} not found`);
    }

    return updatedUser;
  }

  // * only for authenticated users and the user to their own information (me info) *

  async meGetUser(userId: string): Promise<UserDto> {
    const include = {
      roles: {
        where: { status: 'ACTIVE' },
        select: { id: true, name: true, description: true, status: true, permissions: true },
      },
    };

    return this.findById(userId, include);
  }

  async meUpdateUser(userId: string, meUpdateUserDto: any): Promise<UserDto> {
    return this.update(userId, meUpdateUserDto as UpdateUserDto);
  }

  // * auxiliary methods *

  private async getActivePermissionsByIds(permissionIds: string[]) {
    if (!permissionIds.length) return new Map();

    const activePermissions = await this.prisma.userPermission.findMany({
      where: { id: { in: permissionIds }, status: 'ACTIVE' },
      select: { id: true, name: true, code: true, status: true },
    });

    return new Map(activePermissions.map((p) => [p.id, p]));
  }

  private mapRolesWithPermissions(
    roles: any[],
    permissionMap: Map<string, any>,
  ): SimpleRoleWithPermissions[] {
    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description || '',
      status: role.status,
      permissions: (role.permissions || [])
        .filter((perm: any) => permissionMap.has(perm.permissionID))
        .map((perm: any) => {
          const details = permissionMap.get(perm.permissionID)!;
          return {
            id: details.id,
            name: details.name,
            code: details.code,
            status: details.status,
            type: perm.permissions,
            scope: perm.scope,
            actions: perm.actions,
          };
        }),
    }));
  }
}
