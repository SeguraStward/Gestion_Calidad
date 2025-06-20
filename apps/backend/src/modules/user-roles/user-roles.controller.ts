import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { UserRoleDto } from './dtos/user-role.dto';
import { UserRolesService } from './user-roles.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';

@ResourceName('USER_ROLE')
@Controller('user-roles')
export class UserRolesController extends GenericController<UserRoleDto, UserRoleDto> {
  protected readonly logger = new Logger(UserRolesController.name);
  protected readonly resourceName = 'USER_ROLE';
  constructor(private readonly userRolesService: UserRolesService) {
    super(userRolesService);
  }
}
