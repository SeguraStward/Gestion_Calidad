import { Module } from '@nestjs/common';
import { CampusJourneyTimeAllocationsController } from './campus-journey-time-allocations.controller';
import { CampusJourneyTimeAllocationsService } from './campus-journey-time-allocations.service';
import { CampusJourneyTimeAllocationsRepository } from './campus-journey-time-allocations.repository';
import { DtoValidator } from '@core/common/dto-validator';
import { PrismaModule } from '@src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CampusJourneyTimeAllocationsController],
  providers: [CampusJourneyTimeAllocationsService, CampusJourneyTimeAllocationsRepository, DtoValidator],
  exports: [CampusJourneyTimeAllocationsService],
})
export class CampusJourneyTimeAllocationsModule {}
