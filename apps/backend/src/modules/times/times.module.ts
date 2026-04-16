import { Module } from '@nestjs/common';
import { TimesController } from './times.controller';
import { TimesService } from './times.service';

import { AnnualJourneyTimeAllocationsModule } from '../annual-journey-time-allocations/annual-journey-time-allocations.module';
import { CampusJourneyTimeAllocationsModule } from '../campus-journey-time-allocations/campus-journey-time-allocations.module';
import { ProfessorAssignmentsModule } from '../professor-assignments/professor-assignments.module';
import { JourneyTimeConfigsModule } from '../journey-time-configs/journey-time-configs.module';
import { ExternalProvidersModule } from '../external-providers/external-providers.module';
import { InstitutionalProjectsModule } from '../institutional-projects/institutional-projects.module';
import { RepitenciasModule } from '../repitencias/repitencias.module';
import { CohortsModule } from '../cohorts/cohorts.module';
import { CourseReportsModule } from '../course-reports/course-reports.module';
import { ProfessorPortalModule } from '../professor-portal/professor-portal.module';

@Module({
  imports: [
    AnnualJourneyTimeAllocationsModule,
    CampusJourneyTimeAllocationsModule,
    ProfessorAssignmentsModule,
    JourneyTimeConfigsModule,
    ExternalProvidersModule,
    InstitutionalProjectsModule,
    RepitenciasModule,
    CohortsModule,
    CourseReportsModule,
    ProfessorPortalModule,
  ],
  controllers: [TimesController],
  providers: [TimesService],
  exports: [TimesService],
})
export class TimesModule {}
