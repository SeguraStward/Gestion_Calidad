import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { CommissionsService } from './commissions.service';
import { CommissionsController } from './commissions.controller';
import { CommissionsRepository } from './commissions.repository';

@Module({
  imports: [PrismaModule],
  controllers: [CommissionsController],
  providers: [CommissionsService, CommissionsRepository, DtoValidator],
  exports: [CommissionsService, CommissionsRepository],
})
export class CommissionsModule {}
