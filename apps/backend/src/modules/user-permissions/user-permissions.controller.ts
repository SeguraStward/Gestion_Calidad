import { GenericController } from '@core/common/interfaces/generic.controller';
import { Body, Controller, Delete, HttpCode, HttpStatus, Logger, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { PermissionType, Status } from '@una-gc/database/prisma/generated/client';

import { UserPermissionDto } from './dtos/user-permission.dto';
import { UserPermissionsService } from './user-permissions.service';

import { AuthorizedEndpoint } from '@src/core/common/decorators/authorized-endpoint.decorator';
import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';

@ResourceName('USER_PERMISSION')
@Controller('user-permissions')
export class UserPermissionsController extends GenericController<UserPermissionDto, UserPermissionDto> {
  protected readonly logger = new Logger(UserPermissionsController.name);
  protected readonly resourceName = 'USER_PERMISSION';
  constructor(private readonly userPermissionsService: UserPermissionsService) {
    super(userPermissionsService);
  }

  // * CRUD methods are define in the GenericController *
  // NOTE: the permission cant be deleted, only updated or switched status
  @Post()
  @ApiOperation({ summary: 'Create new record' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Record successfully created' })
  @HttpCode(HttpStatus.CREATED)
  @AuthorizedEndpoint(PermissionType.CREATE)
  override async create(@Body() createDto: UserPermissionDto): Promise<UserPermissionDto> {
    throw new Error('Creating permissions is not allowed.');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete record by id' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Record successfully deleted' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @AuthorizedEndpoint(PermissionType.DELETE)
  override async delete(@Param('id') id: string) {
    throw new Error('Deleting permissions is not allowed. You can only switch their status.');
  }

  // * Role management *

  @Patch(':id/switch-status')
  @ApiOperation({ summary: 'Switch permission status between ACTIVE and INACTIVE' })
  @ApiParam({ name: 'id', type: String, description: 'Permission ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Permission status successfully switched',
    type: UserPermissionDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Permission not found' })
  @AuthorizedEndpoint(PermissionType.UPDATE)
  async switchPermissionStatus(@Param('id') id: string): Promise<UserPermissionDto> {
    this.logger.debug(`Switching status for permission with id: ${id}`);

    const currentPermission = await this.userPermissionsService.findById(id);
    if (!currentPermission) {
      this.logger.warn(`Permission with id ${id} not found`);
      throw new Error(`Permission with id ${id} not found`);
    }

    const newStatus = currentPermission.status === Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE;

    this.logger.debug(`Switching permission ${id} from ${currentPermission.status} to ${newStatus}`);

    const updatedPermission = await this.userPermissionsService.update(id, { status: newStatus });

    this.logger.debug(`Permission ${id} status successfully switched to ${newStatus}`);
    return updatedPermission;
  }
}
