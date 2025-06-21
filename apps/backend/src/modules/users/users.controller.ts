import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Query,
  Request,
} from '@nestjs/common';

import { GenericController } from '@core/common/interfaces/generic.controller';

import { UpdateUserDto } from './dtos/update-user.dto';
import { UserDto } from './dtos/user.dto';
import { UsersService } from './users.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';
import { PaginatedResponse } from '@src/core/http/interfaces/paginated-response.interface';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MeUpdateUserDto } from './dtos/me-user-update.dto';

@ResourceName('USER')
@Controller('users')
export class UsersController extends GenericController<UserDto, UserDto> {
  protected readonly logger = new Logger(UsersController.name);
  protected readonly resourceName = 'USER';
  constructor(private readonly usersService: UsersService) {
    super(usersService);
  }

  @Patch(':id/profile')
  @ApiOperation({ summary: 'Update user profile by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User profile updated successfully', type: UserDto })
  async updateProfile(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<UserDto> {
    return this.usersService.updateProfile(id, updateUserDto);
  }

  @Get('by-role/:roleName')
  @ApiOperation({ summary: 'Get users by role name and status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Users retrieved successfully', type: [UserDto] })
  async getUsersByRoleNameAndStatus(
    @Param('roleName') roleName: string,
    @Query('status') status: string = 'ACTIVE',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<PaginatedResponse<UserDto>> {
    this.logger.log(
      `Controller: Finding users with role name: ${roleName}, status: ${status}, page: ${page}, limit: ${limit}`,
    );

    try {
      const pageNumber = Number(page);
      const limitNumber = Number(limit);

      if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
        this.logger.error('Invalid pagination parameters');
        throw new BadRequestException('Page and limit must be positive numbers');
      }

      return await this.usersService.findUsersByRoleNameAndStatus(roleName, status, pageNumber, limitNumber);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(
        `Error finding users by role ${roleName} and status ${status}:`,
        error instanceof Error ? error.stack : JSON.stringify(error),
      );
      throw error;
    }
  }

  // only for authenticated users and the user to get their own information (me info)

  @Get('me/roles/active')
  @ApiOperation({ summary: 'Get active roles for current user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Active roles retrieved successfully', type: [Object] })
  async getMyActiveRoles(@Request() req) {
    const userId = req.user?.id || req.user?.sub;

    if (!userId) {
      this.logger.error('User ID not found in JWT token');
      throw new Error('Invalid authentication token');
    }

    this.logger.debug(`Fetching active roles for authenticated user: ${userId}`);

    try {
      const activeRoles = await this.usersService.getUserActiveRolesWithPermissions(userId);

      if (!activeRoles || activeRoles.length === 0) {
        this.logger.warn(`No active roles found for user ${userId}`);
        return [];
      }

      this.logger.debug(`Roles: ${activeRoles.length}`);

      return activeRoles;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error fetching roles for user ${userId}:`, error.stack);
      } else {
        this.logger.error(`Error fetching roles for user ${userId}:`, JSON.stringify(error));
      }
      throw error;
    }
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User profile retrieved successfully', type: UserDto })
  async meGetUser(@Request() req) {
    const userId = req.user?.id || req.user?.sub;

    if (!userId) {
      this.logger.error('User ID not found in JWT token');
      throw new Error('Invalid authentication token');
    }

    return this.usersService.meGetUser(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User profile updated successfully', type: UserDto })
  async meUpdateUser(@Request() req, @Body() meUpdateUserDto: MeUpdateUserDto) {
    const userId = req.user?.id || req.user?.sub;

    if (!userId) {
      this.logger.error('User ID not found in JWT token');
      throw new Error('Invalid authentication token');
    }

    return this.usersService.meUpdateUser(userId, meUpdateUserDto);
  }
}
