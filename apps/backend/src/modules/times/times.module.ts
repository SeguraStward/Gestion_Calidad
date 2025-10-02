import { Module } from '@nestjs/common';
import { TimesController } from './times.controller';
import { TimesService } from './times.service';
import { TimesRepository } from './times.repository';

// Importar submódulos ya existentes
import { AnnualJourneyTimeAllocationsModule } from '../annual-journey-time-allocations/annual-journey-time-allocations.module';
import { CampusJourneyTimeAllocationsModule } from '../campus-journey-time-allocations/campus-journey-time-allocations.module';
import { ProfessorAssignmentsModule } from '../professor-assignments/professor-assignments.module';
import { JourneyTimeConfigsModule } from '../journey-time-configs/journey-time-configs.module';
import { Prisma } from '@una-gc/database/prisma/generated/client';
import { PrismaModule } from '@src/prisma/prisma.module';

@Module({
  imports: [
    AnnualJourneyTimeAllocationsModule,
    CampusJourneyTimeAllocationsModule,
    ProfessorAssignmentsModule,
    JourneyTimeConfigsModule,
    PrismaModule,
  ],
  controllers: [TimesController],
  providers: [TimesService, TimesRepository],
  exports: [TimesService],
})
export class TimesModule {}
