import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';

import { GenericController } from '@core/common/interfaces/generic.controller';

import { UpdateUserDto } from './dtos/update-user.dto';
import { UserDto } from './dtos/user.dto';
import { UsersService } from './users.service';

import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthorizedEndpoint } from '@src/core/common/decorators/authorized-endpoint.decorator';
import { PaginatedResponse } from '@src/core/http/interfaces/paginated-response.interface';
import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';
import { PermissionType } from '@una-gc/database/prisma/generated/client';
import { ChangeUserStatusDto } from './dtos/change-user-status.dto';
import { MeUpdateUserDto } from './dtos/me-user-update.dto';
import { SetUserRolesDto } from './dtos/set-user-roles.dto';
import { SimpleRoleWithPermissions, SimpleUserRole } from './types';

@ResourceName('USER')
@Controller('users')
export class UsersController extends GenericController<UserDto, UserDto> {
  protected readonly logger = new Logger(UsersController.name);
  protected readonly resourceName = 'USER';
  constructor(private readonly usersService: UsersService) {
    super(usersService);
  }

  // * CRUD methods are define in the GenericController *

  // * special methods *

  @Patch(':id/profile')
  @ApiOperation({ summary: 'Update user profile by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User profile updated successfully', type: UserDto })
  @AuthorizedEndpoint(PermissionType.UPDATE)
  async updateProfile(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<UserDto> {
    this.logger.debug(`🔍 [CONTROLLER] Received updateProfile request for user ${id}`);
    this.logger.debug(`🔍 [CONTROLLER] Raw body:`, JSON.stringify(updateUserDto, null, 2));
    this.logger.debug(`🔍 [CONTROLLER] Body type:`, typeof updateUserDto);
    this.logger.debug(`🔍 [CONTROLLER] Status value:`, updateUserDto.status, 'Type:', typeof updateUserDto.status);

    try {
      const result = await this.usersService.updateProfile(id, updateUserDto);
      this.logger.debug(`✅ [CONTROLLER] Profile update successful for user ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ [CONTROLLER] Profile update failed for user ${id}:`, error);
      throw error;
    }
  }

  @Get('by-role/:roleName')
  @ApiOperation({ summary: 'Get users by role name and status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Users retrieved successfully', type: [UserDto] })
  @AuthorizedEndpoint(PermissionType.READ)
  async getUsersByRoleNameAndStatus(
    @Param('roleName') roleName: string,
    @Query('status') status: string = 'ACTIVE',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<PaginatedResponse<UserDto>> {
    this.logger.log(
      `Finding users with role name: ${roleName}, status: ${status}, page: ${page}, limit: ${limit}`,
    );

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
      throw new BadRequestException('Page and limit must be positive numbers');
    }

    return this.usersService.findUsersByRoleNameAndStatus(roleName, status, pageNumber, limitNumber);
  }

  // only for authenticated users and the user to get their own information (me info)

  @Get('me/roles/active')
  @ApiOperation({ summary: 'Get active roles for current user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Active roles retrieved successfully', type: [Object] })
  async getMyActiveRoles(@Request() req): Promise<SimpleRoleWithPermissions[]> {
    const userId = req.user?.id || req.user?.sub;

    if (!userId) {
      throw new BadRequestException('Invalid authentication token');
    }

    const activeRoles = await this.usersService.getUserActiveRolesWithPermissions(userId);

    if (!activeRoles || activeRoles.length === 0) {
      this.logger.warn(`No active roles found for user ${userId}`);
      return [];
    }

    this.logger.debug(`Found ${activeRoles.length} roles for user ${userId}`);
    return activeRoles;
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User profile retrieved successfully', type: UserDto })
  async meGetUser(@Request() req) {
    const userId = req.user?.id || req.user?.sub;

    if (!userId) {
      throw new BadRequestException('Invalid authentication token');
    }

    return this.usersService.meGetUser(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User profile updated successfully', type: UserDto })
  async meUpdateUser(@Request() req, @Body() meUpdateUserDto: MeUpdateUserDto) {
    const userId = req.user?.id || req.user?.sub;

    if (!userId) {
      throw new BadRequestException('Invalid authentication token');
    }

    return this.usersService.meUpdateUser(userId, meUpdateUserDto);
  }

  // * role management *

  @Get(':id/roles')
  @ApiOperation({ summary: 'Get all roles for a specific user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User roles retrieved successfully',
    type: [Object],
  })
  @AuthorizedEndpoint(PermissionType.READ)
  async getAllUserRoles(
    @Param('id') userId: string,
    @Request() request: any,
  ): Promise<SimpleRoleWithPermissions[]> {
    this.logger.log(`Getting all roles for user: ${userId}`);

    // Debug logging
    const user = request.user;
    const activeRoleId = request.cookies?.user_active_role_id;
    this.logger.debug(`Request user: ${user?.email} (${user?.id})`);
    this.logger.debug(`Active role ID from cookie: ${activeRoleId}`);
    this.logger.debug(`User roles count: ${user?.roles?.length || 0}`);
    this.logger.debug(`Request cookies: ${JSON.stringify(request.cookies)}`);

    const userRoles = await this.usersService.getUserActiveRolesWithPermissions(userId);
    this.logger.debug(`Found ${userRoles.length} roles for user ${userId}`);
    return userRoles;
  }

  @Get(':id/roles-debug')
  @ApiOperation({ summary: 'Debug endpoint - Get all roles for a specific user without auth' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User roles retrieved successfully',
    type: [Object],
  })
  async getAllUserRolesDebug(
    @Param('id') userId: string,
    @Request() request: any,
  ): Promise<any> {
    this.logger.log(`[DEBUG] Getting all roles for user: ${userId}`);

    // Debug info
    const user = request.user;
    const activeRoleId = request.cookies?.user_active_role_id;
    const cookies = request.cookies;

    this.logger.debug(`[DEBUG] Request user: ${user?.email} (${user?.id})`);
    this.logger.debug(`[DEBUG] Active role ID from cookie: ${activeRoleId}`);
    this.logger.debug(`[DEBUG] All cookies: ${JSON.stringify(cookies)}`);
    this.logger.debug(`[DEBUG] User roles count: ${user?.roles?.length || 0}`);

    const userRoles = await this.usersService.getUserActiveRolesWithPermissions(userId);
    this.logger.debug(`[DEBUG] Found ${userRoles.length} roles for user ${userId}`);

    return {
      user: {
        id: user?.id,
        email: user?.email,
        rolesCount: user?.roles?.length || 0
      },
      activeRoleId,
      cookies,
      userRoles
    };
  }

  @Get('all-roles')
  @ApiOperation({ summary: 'Get all roles in the system' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All roles retrieved successfully',
    type: [Object],
  })
  @AuthorizedEndpoint(PermissionType.READ)
  async getAllRoles(): Promise<SimpleUserRole[]> {
    this.logger.log('Getting all roles in the system');
    const roles = await this.usersService.getAllRoles();
    this.logger.debug(`Found ${roles.length} roles in the system`);
    return roles;
  }

  @Patch(':id/roles')
  @ApiOperation({ summary: 'Set user roles (override existing roles)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User roles updated successfully',
    type: UserDto,
  })
  @AuthorizedEndpoint(PermissionType.UPDATE)
  async setUserRoles(
    @Param('id') userId: string,
    @Body() setUserRolesDto: SetUserRolesDto,
  ): Promise<UserDto> {
    this.logger.log(`Setting roles for user: ${userId}, roles: ${setUserRolesDto.roleIds}`);
    const updatedUser = await this.usersService.setUserRoles(userId, setUserRolesDto.roleIds);
    this.logger.debug(`Successfully updated roles for user ${userId}`);
    return updatedUser;
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Change user status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User status updated successfully',
    type: UserDto,
  })
  @AuthorizedEndpoint(PermissionType.UPDATE)
  async changeUserStatus(
    @Param('id') userId: string,
    @Body() changeUserStatusDto: ChangeUserStatusDto,
  ): Promise<UserDto> {
    this.logger.log(`Changing status for user: ${userId} to ${changeUserStatusDto.status}`);
    const updatedUser = await this.usersService.changeUserStatus(userId, changeUserStatusDto.status);
    this.logger.debug(`Successfully updated status for user ${userId}`);
    return updatedUser;
  }

  @Post('bulk-import/professors')
  @ApiOperation({ summary: 'Bulk import professors from Excel' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Professors imported successfully',
  })
  @AuthorizedEndpoint(PermissionType.CREATE)
  async bulkImportProfessors(
    @Body() importDto: { professors: Array<{ cedula: string; nombre: string }> },
  ) {
    this.logger.log(`Starting bulk import of ${importDto.professors.length} professors`);
    const result = await this.usersService.bulkImportProfessors(importDto.professors);
    this.logger.log(`Bulk import completed: ${result.created} created, ${result.updated} updated, ${result.errors} errors`);
    return result;
  }

  // ignore change status from generic controller
}
