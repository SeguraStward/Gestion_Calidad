import { Module } from '@nestjs/common';
import { AnnualJourneyTimeAllocationsController } from './annual-journey-time-allocations.controller';
import { AnnualJourneyTimeAllocationsService } from './annual-journey-time-allocations.service';
import { AnnualJourneyTimeAllocationsRepository } from './annual-journey-time-allocations.repository';
import { DtoValidator } from '@core/common/dto-validator';

@Module({
  controllers: [AnnualJourneyTimeAllocationsController],
  providers: [AnnualJourneyTimeAllocationsService, AnnualJourneyTimeAllocationsRepository, DtoValidator],
  exports: [AnnualJourneyTimeAllocationsService],
})
export class AnnualJourneyTimeAllocationsModule {}
