import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { UserPermissionDto } from './dtos/user-permission.dto';
import { UserPermission } from '@una-gc/database/prisma/generated/client';
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
}
