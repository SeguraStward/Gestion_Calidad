import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { UserPermissionsService } from './user-permissions.service';
import { UserPermissionsController } from './user-permissions.controller';
import { UserPermissionsRepository } from './user-permissions.repository';

@Module({
  imports: [PrismaModule],
  controllers: [UserPermissionsController],
  providers: [UserPermissionsService, UserPermissionsRepository, DtoValidator],
  exports: [UserPermissionsService, UserPermissionsRepository],
})
export class UserPermissionsModule {}
