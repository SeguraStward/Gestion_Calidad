import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { UserRoleDto } from './dtos/user-role.dto';
import { UserRolesService } from './user-roles.service';

@Controller('user-roles')
export class UserRolesController extends GenericController<UserRoleDto, UserRoleDto> {
  protected readonly logger = new Logger(UserRolesController.name);
  protected readonly resourceName = 'USER_ROLE';
  constructor(private readonly userRolesService: UserRolesService) {
    super(userRolesService);
  }
}
