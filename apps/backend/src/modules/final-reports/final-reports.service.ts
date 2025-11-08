import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaginatedResponse } from '@core/http/interfaces/paginated-response.interface';
import { FinalReport, Prisma, FinalReportStatus } from '@una-gc/database/prisma/generated/client';

import { FinalReportDto } from './dtos/final-report.dto';
import { FinalReportsRepository } from './final-reports.repository';

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
  ) {
    super(finalReportsRepository, FinalReportDto);
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

    // Implementar búsqueda con prioridad para coincidencias exactas de NRC
    if (search) {
      where.OR = [
        // Coincidencia exacta del NRC tiene la prioridad más alta
        { academicLoad: { nrc: { equals: search, mode: 'insensitive' } } },
        // Luego coincidencias que empiecen con el término de búsqueda
        { academicLoad: { nrc: { startsWith: search, mode: 'insensitive' } } },
        { academicLoad: { course: { name: { startsWith: search, mode: 'insensitive' } } } },
        // Finalmente coincidencias que contengan el término
        { academicLoad: { nrc: { contains: search, mode: 'insensitive' } } },
        { academicLoad: { course: { name: { contains: search, mode: 'insensitive' } } } },
        { academicLoad: { course: { code: { contains: search, mode: 'insensitive' } } } },
        { professor: { fullName: { contains: search, mode: 'insensitive' } } },
      ];
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

    // Búsqueda avanzada
    if (search) {
      where.OR = [
        { academicLoad: { nrc: { equals: search, mode: 'insensitive' } } },
        { academicLoad: { nrc: { startsWith: search, mode: 'insensitive' } } },
        { academicLoad: { nrc: { contains: search, mode: 'insensitive' } } },
        { academicLoad: { course: { name: { contains: search, mode: 'insensitive' } } } },
        { academicLoad: { course: { code: { contains: search, mode: 'insensitive' } } } },
        { professor: { fullName: { contains: search, mode: 'insensitive' } } },
        { professor: { email: { contains: search, mode: 'insensitive' } } },
        { academicLoad: { academicCycle: { name: { contains: search, mode: 'insensitive' } } } },
        { academicLoad: { campus: { name: { contains: search, mode: 'insensitive' } } } },
      ];
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
