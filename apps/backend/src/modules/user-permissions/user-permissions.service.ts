import { DtoValidator } from '@core/common/dto-validator';
import { GenericService } from '@core/common/interfaces/generic.service';
import { Injectable, Logger } from '@nestjs/common';

import { UserPermission } from '@una-gc/database/prisma/generated/client';
import { UserPermissionDto } from './dtos/user-permission.dto';
import { UserPermissionsRepository } from './user-permissions.repository';

@Injectable()
export class UserPermissionsService extends GenericService<
  UserPermission,
  UserPermissionDto,
  UserPermissionDto
> {
  protected readonly logger = new Logger(UserPermissionsService.name);

  protected readonly relationCheckConfig = {
    relationFields: [''],
    errorMessage: 'Cannot delete UserPermission because it has associated: none.',
  };

  constructor(
    protected readonly userPermissionsRepository: UserPermissionsRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(userPermissionsRepository, UserPermissionDto);
  }

  // * CRUD methods are defined in the GenericService *
  // NOTE: the permission cant be deleted, only updated or switched status
}
