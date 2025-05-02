import { GenericService } from '@core/common/interfaces/generic.service';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UserDto } from './dtos/user.dto';
import { User } from '@una-gc/database/prisma/generated/client';
import { DtoValidator } from '@core/common/dto-validator';
import { UsersRepository } from './users.repository';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UsersService extends GenericService<User, UserDto, UserDto> {
  protected readonly logger = new Logger(UsersService.name);

  constructor(
    protected readonly usersRepository: UsersRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(usersRepository, UserDto);
  }

  async updateProfile(id: string, updateUserDto: UpdateUserDto): Promise<UserDto> {
    const existingUser = await this.usersRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updateData: any = {};

    if (updateUserDto.fullName !== undefined) {
      updateData.fullName = updateUserDto.fullName;
    }

    if (updateUserDto.fullLastName !== undefined) {
      updateData.fullLastName = updateUserDto.fullLastName;
    }

    if (updateUserDto.primaryPhone !== undefined) {
      updateData.primaryPhone = updateUserDto.primaryPhone;
    }

    if (updateUserDto.email) {
      updateData.email = updateUserDto.email;
    }

    existingUser.version = existingUser.version ? existingUser.version + 1 : 1;

    const updatedUser = await this.usersRepository.update(id, updateData);

    return new UserDto(updatedUser);
  }
}
