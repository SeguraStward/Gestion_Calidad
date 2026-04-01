import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { CourseReport, Prisma } from '@una-gc/database/prisma/generated/client';

@Injectable()
export class CourseReportsRepository extends GenericPrismaRepository<
  CourseReport,
  Prisma.CourseReportCreateInput,
  Prisma.CourseReportUpdateInput,
  Prisma.CourseReportWhereUniqueInput
> {
  protected readonly modelName = 'courseReport' as const;

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByCohort(cohortId: string) {
    // CourseReport no tiene cohortId directo; se relaciona vía CohortCourseProjection
    return this.prismaService.courseReport.findMany({
      where: {},
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obtiene reportes de un campus filtrando solo los de los últimos 2 años
   * relativos al año del ciclo pasado como referencia.
   */
  async findForProjection(campusId: string, referenceYear: number) {
    const twoYearsAgo = referenceYear - 2;

    const cycles = await this.prismaService.academicCycle.findMany({
      where: { year: { gte: twoYearsAgo } },
      select: { id: true },
    });

    const cycleIds = cycles.map((c) => c.id);

    return this.prismaService.courseReport.findMany({
      where: {
        campusId,
        academicCycleId: { in: cycleIds },
        isFinal: true,
        status: 'SUBMITTED',
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCampus(campusId: string) {
    return this.prismaService.courseReport.findMany({
      where: { campusId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
