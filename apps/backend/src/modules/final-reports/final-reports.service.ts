import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';
import { PaginatedResponse } from '@core/http/interfaces/paginated-response.interface';
import { FinalReport, Prisma, FinalReportStatus } from '@una-gc/database/prisma/generated/client';

import { FinalReportDto } from './dtos/final-report.dto';
import { FinalReportsRepository } from './final-reports.repository';

@Injectable()
export class FinalReportsService extends GenericService<FinalReport, FinalReportDto, FinalReportDto> {
  protected readonly logger = new Logger(FinalReportsService.name);

  protected readonly relationCheckConfig = {
    relationFields: [''],
    errorMessage: 'Cannot delete FinalReport because it has associated: none.',
  };

  constructor(
    protected readonly finalReportsRepository: FinalReportsRepository,
    protected readonly dtoValidator: DtoValidator, // Assuming DtoValidator is used for create/update
  ) {
    super(finalReportsRepository, FinalReportDto); // Pass FinalReportDto for transformation
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
}
