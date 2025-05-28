import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service'; // Adjust path if needed
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { FinalReport, Prisma } from '@una-gc/database/prisma/generated/client';

@Injectable()
export class FinalReportsRepository extends GenericPrismaRepository<
  FinalReport,
  Prisma.FinalReportCreateInput,
  Prisma.FinalReportUpdateInput,
  Prisma.FinalReportWhereUniqueInput
> {
  private readonly logger = new Logger(FinalReportsRepository.name);
  protected readonly modelName: string = 'finalReport'; // Ensure this matches Prisma client

  protected readonly defaultIncludes: Prisma.FinalReportInclude = {
    // For FinalReport itself, you can also use 'select' if you don't want all its direct fields
    // finalReportSelect: { id: true, status: true /* ... other direct FinalReport fields you need */ },

    academicLoad: {
      select: {
        // Select specific fields from AcademicLoad
        id: true,
        nrc: true,
        status: true,
        // academicCycleId: true, // Only if you need the ID and not the object
        // courseId: true,       // Only if you need the ID and not the object
        // professorId: true,    // Only if you need the ID and not the object
        // campusId: true,       // Only if you need the ID and not the object
        course: {
          select: {
            // Select specific fields from Course
            id: true,
            name: true,
            code: true,
            // credits: true, // Add other course fields you need
          },
        },
        academicCycle: {
          select: {
            // Select specific fields from AcademicCycle
            id: true,
            name: true,
            year: true,
            // startDate: true, // Add other academicCycle fields you need
            // endDate: true,
          },
        },
        professor: {
          // This is the professor linked to AcademicLoad
          select: {
            // Select specific fields from User (Professor)
            id: true,
            fullName: true,
            email: true,
            // photoUrl: true, // Add other professor fields you need
          },
        },
        campus: {
          select: {
            // Select specific fields from Campus
            id: true,
            name: true,
            code: true,
            // description: true, // Add other campus fields you need
          },
        },
      },
    },
    professor: {
      // This is the professor directly linked to FinalReport
      select: {
        // Select specific fields from User (Professor)
        id: true,
        fullName: true,
        email: true,
        // photoUrl: true, // Add other professor fields you need
      },
    },
    // You don't need to select for composite types like statistics, evaluation, studentInformation
    // as they are part of the FinalReport document itself, not separate relations in this context.
  };

  constructor(protected readonly prismaService: PrismaService) {
    super(prismaService);
    this.logger.debug('FinalReportsRepository initialized');
  }

  // You might have other methods here
}
