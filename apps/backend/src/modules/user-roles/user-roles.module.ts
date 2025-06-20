import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { UserRolesService } from './user-roles.service';
import { UserRolesController } from './user-roles.controller';
import { UserRolesRepository } from './user-roles.repository';

@Module({
  imports: [PrismaModule],
  controllers: [UserRolesController],
  providers: [UserRolesService, UserRolesRepository, DtoValidator],
  exports: [UserRolesService, UserRolesRepository],
})
export class UserRolesModule {}
