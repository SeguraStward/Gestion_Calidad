import { GenericService } from '@core/common/interfaces/generic.service';

import { DtoValidator } from '@core/common/dto-validator';

import { Injectable, Logger } from '@nestjs/common';

import { AcademicBackgroundDto } from './dtos/academic-background.dto';

import { AcademicBackground } from '@una-gc/database/prisma/generated/client';

import { AcademicBackgroundsRepository } from './academic-backgrounds.repository';

@Injectable()
export class AcademicBackgroundsService extends GenericService<
  AcademicBackground,
  AcademicBackgroundDto,
  AcademicBackgroundDto
> {
  protected readonly logger = new Logger(AcademicBackgroundsService.name);

  constructor(
    protected readonly academicBackgroundsRepository: AcademicBackgroundsRepository,

    protected readonly dtoValidator: DtoValidator,
  ) {
    super(academicBackgroundsRepository, AcademicBackgroundDto);
  }
}
