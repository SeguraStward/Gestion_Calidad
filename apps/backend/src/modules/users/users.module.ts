import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';

@Module({
  imports: [PrismaModule],
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, DtoValidator],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
