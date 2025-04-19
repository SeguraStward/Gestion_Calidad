import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';
import { UserDto } from './dtos/user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController extends GenericController<UserDto, UserDto> {
  protected readonly logger = new Logger(UsersController.name);
  constructor(private readonly usersService: UsersService) {
    super(usersService);
  }
}
