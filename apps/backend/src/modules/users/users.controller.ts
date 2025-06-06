import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { GenericController } from '@core/common/interfaces/generic.controller';
import { JwtAuthGuard } from '@src/modules/auth/guards/jwt-auth.guard';

import { UpdateUserDto } from './dtos/update-user.dto';
import { UserDto } from './dtos/user.dto';
import { UsersService } from './users.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';
import { PaginatedResponse } from '@src/core/http/interfaces/paginated-response.interface';
@ResourceName('USER')
@ApiTags('Users')
@Controller('users')
export class UsersController extends GenericController<UserDto, UserDto> {
  protected readonly logger = new Logger(UsersController.name);
  protected readonly resourceName = 'USER';
  constructor(private readonly usersService: UsersService) {
    super(usersService);
  }

  @Patch(':id/profile')
  @ApiOperation({ summary: 'Update user profile information' })
  @ApiResponse({
    status: 200,
    description: 'User profile was updated successfully',
    type: UserDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateProfile(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<UserDto> {
    return this.usersService.updateProfile(id, updateUserDto);
  }

  @Get('me/roles/active')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get active roles with active permissions for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Active roles with active permissions successfully retrieved',
  })
  async getMyActiveRoles(@Request() req) {
    // Extract user ID from the JWT token payload
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
      // return await this.usersService.getUserActiveRolesWithPermissions(userId);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error fetching roles for user ${userId}:`, error.stack);
      } else {
        this.logger.error(`Error fetching roles for user ${userId}:`, JSON.stringify(error));
      }
      throw error;
    }
  }

  @Get('by-role/:roleName')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Find users by role name and status with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Users filtered by role and status successfully retrieved',
    type: UserDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
      // Convert string parameters to appropriate types
      const pageNumber = Number(page);
      const limitNumber = Number(limit);

      // Validate pagination parameters
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
}
