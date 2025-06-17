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
    orderBy?: Prisma.FinalReportOrderByWithRelationInput,
    include?: Prisma.FinalReportInclude,
  ): Promise<PaginatedResponse<FinalReportDto>> {
    this.logger.debug(
      `Finding all final reports for professorId: ${professorId}, status: ${status}, page: ${page}, limit: ${limit}`,
    );
    const where: Prisma.FinalReportWhereInput = {
      professorId: professorId,
    };

    if (status) {
      where.status = status;
    }

    // Call the generic findAll method from the base GenericService
    return super.findAll(page, limit, where, orderBy, include);
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
