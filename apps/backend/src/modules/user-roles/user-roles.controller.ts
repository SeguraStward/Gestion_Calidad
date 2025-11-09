import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Get, HttpStatus, Logger, Param, Patch, Body } from '@nestjs/common';

import { UserRoleDto } from './dtos/user-role.dto';
import { UserRolesService } from './user-roles.service';

import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';
import { RoleWithPermissions, SimpleUserPermission } from './types';

import { AuthorizedEndpoint } from '@core/common/decorators/authorized-endpoint.decorator';
import { PermissionType } from '@una-gc/database/prisma/generated/client';

@ResourceName('USER_ROLE')
@Controller('user-roles')
export class UserRolesController extends GenericController<UserRoleDto, UserRoleDto> {
  protected readonly logger = new Logger(UserRolesController.name);
  protected readonly resourceName = 'USER_ROLE';
  constructor(private readonly userRolesService: UserRolesService) {
    super(userRolesService);
  }

  // * CRUD methods are define in the GenericController *

  // * Role management *

  // 1. get role with permission
  @Get('/roles-permissions/:roleId')
  @AuthorizedEndpoint(PermissionType.READ)
  @ApiOperation({ summary: 'Get active roles for current user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Active roles retrieved successfully', type: [Object] })
  async RolesPermission(@Param('roleId') roleId: string): Promise<RoleWithPermissions> {
    try {
      return await this.userRolesService.getRoleWithPermissions(roleId);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error fetching roles:`, error.stack);
      } else {
        this.logger.error(`Error fetching roles:`, JSON.stringify(error));
      }
      throw error;
    }
  }

  // 2. get all permissions
  @Get('/permissions')
  @AuthorizedEndpoint(PermissionType.READ)
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All permissions retrieved successfully',
    type: [Object],
  })
  async getAllPermissions(): Promise<SimpleUserPermission[]> {
    try {
      return await this.userRolesService.getAllPermissions();
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error fetching permissions:`, error.stack);
      } else {
        this.logger.error(`Error fetching permissions:`, JSON.stringify(error));
      }
      throw error;
    }
  }

  // 3. Update role permissions
  @Patch('/:roleId/permissions')
  @AuthorizedEndpoint(PermissionType.UPDATE)
  @ApiOperation({ summary: 'Update permissions for a role' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role permissions updated successfully',
    type: Object,
  })
  async updateRolePermissions(
    @Param('roleId') roleId: string,
    @Body() body: {
      permissions: Array<{
        permissionID: string;
        permissions: string[];
        scope: string;
        actions: string[];
      }>
    }
  ): Promise<RoleWithPermissions> {
    try {
      this.logger.log(`Updating permissions for role ${roleId}`);
      return await this.userRolesService.updateRolePermissions(roleId, body.permissions);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error updating role permissions:`, error.stack);
      } else {
        this.logger.error(`Error updating role permissions:`, JSON.stringify(error));
      }
      throw error;
    }
  }
}
