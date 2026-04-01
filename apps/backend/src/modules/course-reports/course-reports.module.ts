import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';

import { CourseReportsController } from './course-reports.controller';
import { CourseReportsService } from './course-reports.service';
import { CourseReportsRepository } from './course-reports.repository';

@Module({
  imports: [PrismaModule],
  controllers: [CourseReportsController],
  providers: [CourseReportsService, CourseReportsRepository],
  exports: [CourseReportsService, CourseReportsRepository],
})
export class CourseReportsModule {}
