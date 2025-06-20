import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { FinalWorkDto } from './dtos/final-work.dto';
import { FinalWork } from '@una-gc/database/prisma/generated/client';
import { FinalWorksRepository } from './final-works.repository';

@Injectable()
export class FinalWorksService extends GenericService<FinalWork, FinalWorkDto, FinalWorkDto> {
  protected readonly logger = new Logger(FinalWorksService.name);

  protected readonly relationCheckConfig = {
    relationFields: [''],
    errorMessage: 'Cannot delete FinalWork because it has associated: none.',
  };

  constructor(
    protected readonly finalWorksRepository: FinalWorksRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(finalWorksRepository, FinalWorkDto);
  }
}
