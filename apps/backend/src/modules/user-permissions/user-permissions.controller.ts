import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { UserPermissionDto } from './dtos/user-permission.dto';
import { UserPermissionsService } from './user-permissions.service';

@Controller('user-permissions')
export class UserPermissionsController extends GenericController<UserPermissionDto, UserPermissionDto> {
  protected readonly logger = new Logger(UserPermissionsController.name);
  constructor(private readonly userPermissionsService: UserPermissionsService) {
    super(userPermissionsService);
  }
}
