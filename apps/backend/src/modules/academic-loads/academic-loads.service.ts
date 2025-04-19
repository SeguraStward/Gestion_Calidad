import { GenericService } from '@core/common/interfaces/generic.service';
import { Injectable, Logger } from '@nestjs/common';
import { AcademicLoadDto } from './dtos/academic-load.dto';
import { AcademicLoad } from '@una-gc/database/prisma/generated/client';
import { DtoValidator } from '@core/common/dto-validator';
import { AcademicLoadsRepository } from './academic-loads.repository';

@Injectable()
export class AcademicLoadsService extends GenericService<AcademicLoad, AcademicLoadDto, AcademicLoadDto> {
  protected readonly logger = new Logger(AcademicLoadsService.name);

  constructor(
    protected readonly academicLoadsRepository: AcademicLoadsRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(academicLoadsRepository, AcademicLoadDto);
  }
}
