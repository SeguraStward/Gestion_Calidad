import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { CareerDto } from './dtos/career.dto';
import { Career } from '@una-gc/database/prisma/generated/client';
import { CareersRepository } from './careers.repository';

@Injectable()
export class CareersService extends GenericService<Career, CareerDto, CareerDto, CareerDto> {
  protected readonly logger = new Logger(CareersService.name);

  protected readonly relationCheckConfig = {
    relationFields: ['courses', 'projects'],
    errorMessage: 'Cannot delete career because it has associated courses or projects.',
  };

  constructor(
    protected readonly careersRepository: CareersRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(careersRepository, CareerDto);
  }
}
