import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { StandardsService } from './standards.service';
import { StandardsController } from './standards.controller';
import { StandardsRepository } from './standards.repository';

@Module({
  imports: [PrismaModule],
  controllers: [StandardsController],
  providers: [StandardsService, StandardsRepository, DtoValidator],
  exports: [StandardsService, StandardsRepository],
})
export class StandardsModule { }
