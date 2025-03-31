import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { UsersRepository } from './repositories/users.repository';
import { DtoValidator } from '@core/common/dto-validator';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [UsersController],
  providers: [PrismaService, UsersService, UsersRepository, DtoValidator],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
