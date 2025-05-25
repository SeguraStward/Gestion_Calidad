import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { UserRoleDto } from './dtos/user-role.dto';
import { UserRole } from '@una-gc/database/prisma/generated/client';
import { UserRolesRepository } from './user-roles.repository';

@Injectable()
export class UserRolesService extends GenericService<UserRole, UserRoleDto, UserRoleDto> {
  protected readonly logger = new Logger(UserRolesService.name);

  constructor(
    protected readonly userRolesRepository: UserRolesRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(userRolesRepository, UserRoleDto);
  }
}
