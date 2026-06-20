import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaginatedResponse } from '@core/http/interfaces/paginated-response.interface';
import { FinalReport, Prisma, FinalReportStatus } from '@una-gc/database/prisma/generated/client';

import { FinalReportDto } from './dtos/final-report.dto';
import { FinalReportsRepository } from './final-reports.repository';
import { PrismaService } from '@src/prisma/prisma.service';

@Injectable()
export class FinalReportsService extends GenericService<FinalReport, FinalReportDto, FinalReportDto> {
  protected readonly logger = new Logger(FinalReportsService.name);

  protected readonly relationCheckConfig = {
    relationFields: [],
    errorMessage: 'Cannot delete FinalReport because it has associated: none.',
  };

  constructor(
    protected readonly finalReportsRepository: FinalReportsRepository,
    protected readonly dtoValidator: DtoValidator,
    private readonly prisma: PrismaService,
  ) {
    super(finalReportsRepository, FinalReportDto);
  }

  /**
   * Build the final-report search filter WITHOUT Prisma relation filters.
   * On MongoDB, filtering FinalReport by nested relations (`{ academicLoad: {...} }`,
   * `{ professor: {...} }`) generates a `$size` aggregation that throws
   * (Error 17124 "$size must be an array, but was of type: null") when some
   * documents have null FKs. Instead we resolve the matching ids with scalar
   * queries and filter FinalReport by scalar FKs (`in`), which never aggregates.
   */
  private async buildSearchOr(search: string): Promise<Prisma.FinalReportWhereInput[]> {
    const ci = { contains: search, mode: 'insensitive' as const };
    const [courses, cycles, campuses, profs] = await Promise.all([
      this.prisma.course.findMany({
        where: { OR: [{ name: ci }, { code: ci }] },
        select: { id: true },
      }),
      this.prisma.academicCycle.findMany({ where: { name: ci }, select: { id: true } }),
      this.prisma.campus.findMany({ where: { name: ci }, select: { id: true } }),
      this.prisma.user.findMany({
        where: { OR: [{ fullName: ci }, { email: ci }] },
        select: { id: true },
      }),
    ]);
    const loads = await this.prisma.academicLoad.findMany({
      where: {
        OR: [
          { nrc: ci },
          { courseId: { in: courses.map((c) => c.id) } },
          { academicCycleId: { in: cycles.map((c) => c.id) } },
          { campusId: { in: campuses.map((c) => c.id) } },
        ],
      },
      select: { id: true },
    });
    return [
      { academicLoadId: { in: loads.map((l) => l.id) } },
      { professorId: { in: profs.map((p) => p.id) } },
    ];
  }

  async findAllByProfessorId(
    professorId: string,
    page = 1,
    limit = 10,
    status?: FinalReportStatus,
    search?: string,
    orderBy?: Prisma.FinalReportOrderByWithRelationInput,
    include?: Prisma.FinalReportInclude,
  ): Promise<PaginatedResponse<FinalReportDto>> {
    this.logger.debug(
      `Finding all final reports for professorId: ${professorId}, status: ${status}, search: ${search}, page: ${page}, limit: ${limit}`,
    );

    const where: Prisma.FinalReportWhereInput = {
      professorId: professorId,
    };

    if (status) {
      where.status = status;
    }

    // Search by NRC / course / cycle / professor. Uses scalar-FK filtering
    // (see buildSearchOr) to avoid the MongoDB relation-filter $size crash.
    if (search) {
      where.AND = [{ OR: await this.buildSearchOr(search) }];
    }

    // Ordenamiento personalizado para priorizar coincidencias exactas
    let finalOrderBy = orderBy;
    if (search && !orderBy) {
      // Si hay búsqueda y no se especifica ordenamiento, ordenamos por relevancia
      // Prisma no soporta ordenamiento condicional directamente, pero podemos usar el campo createdAt
      // como fallback después de que la consulta OR ya haya priorizado las coincidencias exactas
      finalOrderBy = { createdAt: 'desc' };
    }

    // Call the generic findAll method from the base GenericService
    return super.findAll(page, limit, where, finalOrderBy, include);
  }

  async findAllForAdmin(
    page = 1,
    limit = 10,
    status?: FinalReportStatus,
    professorId?: string,
    search?: string,
    orderBy?: Prisma.FinalReportOrderByWithRelationInput,
    include?: Prisma.FinalReportInclude,
  ): Promise<PaginatedResponse<FinalReportDto>> {
    this.logger.debug(
      `Admin: Finding all final reports - status: ${status}, professorId: ${professorId}, search: ${search}, page: ${page}, limit: ${limit}`,
    );

    const where: Prisma.FinalReportWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (professorId) {
      where.professorId = professorId;
    }

    // Búsqueda avanzada (scalar-FK filtering — evita el crash $size de Mongo)
    if (search) {
      where.AND = [{ OR: await this.buildSearchOr(search) }];
    }

    let finalOrderBy = orderBy || { createdAt: 'desc' };

    return super.findAll(page, limit, where, finalOrderBy, include);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async evaluatePendingFinalReports() {
    this.logger.log('Executing daily evaluation of pending final reports...');
    const today = new Date();

    const pendingReports = await this.finalReportsRepository.findPendingWithEndedCycle(today);

    if (pendingReports.length === 0) {
      this.logger.log('There is no reports to update.');
      return;
    }

    for (const report of pendingReports) {
      await this.update(report.id, { status: 'EVALUATED' }); // update viene del GenericService
      this.logger.log(`Report ${report.id} updated to EVALUATED.`);
    }
    this.logger.log(`Total amount of updated reports: ${pendingReports.length}`);
  }
}
