import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { IntellectualProductionsService } from './intellectual-productions.service';
import { IntellectualProductionsController } from './intellectual-productions.controller';
import { IntellectualProductionsRepository } from './intellectual-productions.repository';

@Module({
  imports: [PrismaModule],
  controllers: [IntellectualProductionsController],
  providers: [IntellectualProductionsService, IntellectualProductionsRepository, DtoValidator],
  exports: [IntellectualProductionsService, IntellectualProductionsRepository],
})
export class IntellectualProductionsModule {}
