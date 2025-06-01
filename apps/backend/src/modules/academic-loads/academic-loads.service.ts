import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { AcademicLoadDto } from './dtos/academic-load.dto';
import { AcademicLoad, Prisma, Status } from '@una-gc/database/prisma/generated/client';
import { AcademicLoadsRepository } from './academic-loads.repository';
import { PaginatedResponse } from '@core/http/interfaces/paginated-response.interface';

@Injectable()
export class AcademicLoadsService extends GenericService<AcademicLoad, AcademicLoadDto, AcademicLoadDto> {
  protected readonly logger = new Logger(AcademicLoadsService.name);

  constructor(
    protected readonly academicLoadsRepository: AcademicLoadsRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(academicLoadsRepository, AcademicLoadDto);
  }

  async findAllByProfessorId(
    professorId: string,
    page = 1,
    limit = 10,
    status?: Status,
    orderBy?: Prisma.AcademicLoadOrderByWithRelationInput,
    include?: Prisma.AcademicLoadInclude,
  ): Promise<PaginatedResponse<AcademicLoadDto>> {
    this.logger.debug(
      `[AcademicLoadsService] findAllByProfessorId called with: professorId=${professorId}, status=${status}, page=${page}, limit=${limit}`,
    );

    const where: Prisma.AcademicLoadWhereInput = {
      professorId: professorId,
    };

    if (status) {
      this.logger.debug(`[AcademicLoadsService] Applying status filter: ${status}`);
      where.status = status;
    } else {
      this.logger.debug('[AcademicLoadsService] No status filter applied.');
    }

    this.logger.log(
      `[AcademicLoadsService] Final 'where' clause being passed to super.findAll: ${JSON.stringify(where)}`,
    );

    return super.findAll(page, limit, where, orderBy, include);
  }
}
