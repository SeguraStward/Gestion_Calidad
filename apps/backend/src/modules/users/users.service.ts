import { GenericService } from '@core/common/interfaces/generic.service';
import { Injectable, Logger } from '@nestjs/common';
import { UserDto } from './dtos/user.dto';
import { User } from '@una-gc/database/prisma/generated/client';
import { DtoValidator } from '@core/common/dto-validator';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService extends GenericService<User, UserDto, UserDto> {
  protected readonly logger = new Logger(UsersService.name);

  constructor(
    protected readonly usersRepository: UsersRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(usersRepository, UserDto);
  }
}
