import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { RegionalCentersService } from './regional-centers.service';
import { RegionalCentersController } from './regional-centers.controller';
import { RegionalCentersRepository } from './regional-centers.repository';

@Module({
  imports: [PrismaModule],
  controllers: [RegionalCentersController],
  providers: [RegionalCentersService, RegionalCentersRepository, DtoValidator],
  exports: [RegionalCentersService, RegionalCentersRepository],
})
export class RegionalCentersModule {}
