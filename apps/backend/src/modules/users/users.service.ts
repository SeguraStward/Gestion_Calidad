import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { User } from '@una-gc/database/prisma/generated/client';

import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';

import { UsersRepository } from './users.repository';

import { UserDto } from './dtos/user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

import { PrismaService } from '@src/prisma/prisma.service';
import { PaginatedResponse } from '@src/core/http/interfaces/paginated-response.interface';

@Injectable()
export class UsersService extends GenericService<User, UserDto, UserDto> {
  protected readonly logger = new Logger(UsersService.name);

  constructor(
    protected readonly usersRepository: UsersRepository,
    protected readonly dtoValidator: DtoValidator,
    protected readonly prisma: PrismaService,
  ) {
    super(usersRepository, UserDto);
  }

  async updateProfile(id: string, updateUserDto: UpdateUserDto): Promise<UserDto> {
    const existingUser = await this.usersRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updateData: any = {};

    if (updateUserDto.fullName !== undefined) {
      updateData.fullName = updateUserDto.fullName;
    }

    if (updateUserDto.fullLastName !== undefined) {
      updateData.fullLastName = updateUserDto.fullLastName;
    }

    if (updateUserDto.primaryPhone !== undefined) {
      updateData.primaryPhone = updateUserDto.primaryPhone;
    }

    if (updateUserDto.email) {
      updateData.email = updateUserDto.email;
    }

    existingUser.version = existingUser.version ? existingUser.version + 1 : 1;

    const updatedUser = await this.usersRepository.update(id, updateData);

    return new UserDto(updatedUser);
  }

  /**
   * Retrieves active roles with their active permissions for a specific user
   * @param userId - The ID of the user
   * @returns Array of user active roles with active permissions including permission details
   */
  async getUserActiveRolesWithPermissions(userId: string) {
    this.logger.log(`Getting active roles with permissions for user: ${userId}`);

    // Find the user with their roles included
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          where: { status: 'ACTIVE' }, // Only include active roles
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
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Get a list of all permission IDs from the user's roles
    const permissionIds = user.roles.flatMap((role) => role.permissions).map((perm) => perm.permissionID);

    // Fetch all active permissions from the database with their details
    const activePermissions = await this.prisma.userPermission.findMany({
      where: {
        id: { in: [...new Set(permissionIds)] }, // Remove duplicates
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        code: true,
        status: true,
      },
    });

    // Create a lookup map for quick permission checking and access to permission details
    const activePermissionMap = new Map(activePermissions.map((permission) => [permission.id, permission]));

    // Filter out inactive permissions from roles and enrich with permission details
    const rolesWithActivePermissions = user.roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions
        .filter((permission) => activePermissionMap.has(permission.permissionID))
        .map((permission) => {
          const permissionDetails = activePermissionMap.get(permission.permissionID);
          return {
            id: permissionDetails.id,
            name: permissionDetails.name,
            code: permissionDetails.code,
            status: permissionDetails.status,
            type: permission.permissions,
            scope: permission.scope,
            actions: permission.actions,
          };
        }),
    }));

    return rolesWithActivePermissions;
  }

  /**
   * Retrieves a specific active role with its active permissions for a user
   * @param userId - The ID of the user
   * @param roleId - The ID of the role to retrieve
   * @returns The specified active role with active permissions or null if not found
   */
  async getUserActiveRoleById(userId: string, roleId: string) {
    this.logger.log(`Getting active role ${roleId} with permissions for user: ${userId}`);

    const activeRoles = await this.getUserActiveRolesWithPermissions(userId);

    // Find the specific role
    const requestedRole = activeRoles.find((role) => role.id === roleId);

    if (!requestedRole) {
      this.logger.warn(`Role ${roleId} not found or not active for user ${userId}`);
      return null;
    }

    return requestedRole;
  }

  /**
   * Finds users by role name and user status
   * @param roleName - Name of the role to filter users by
   * @param userStatus - Status of the user (e.g., 'ACTIVE', 'INACTIVE')
   * @param page - Page number for pagination
   * @param limit - Number of items per page
   * @returns Paginated list of users with the specified role and user status
   */
  async findUsersByRoleNameAndStatus(
    roleName: string,
    userStatus: string = 'ACTIVE',
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<UserDto>> {
    this.logger.log(`Finding users with role name: ${roleName} and user status: ${userStatus}`);

    try {
      // Create a where clause for the query
      const where = {
        status: userStatus, // Filter by user status instead of role status
        roles: {
          some: {
            name: roleName,
          },
        },
      };

      // Use the parent class's findAll method which handles pagination and DTO transformation
      return await super.findAll(page, limit, where);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error finding users by role and status: ${error.message}`, error.stack);
      } else {
        this.logger.error(`Error finding users by role and status:`, JSON.stringify(error));
      }
      throw error;
    }
  }
}
