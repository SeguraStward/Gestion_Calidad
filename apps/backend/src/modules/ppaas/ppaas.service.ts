import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { PpaaDto } from './dtos/ppaa.dto';
import { Ppaa } from '@una-gc/database/prisma/generated/client';
import { PpaasRepository } from './ppaas.repository';

@Injectable()
export class PpaasService extends GenericService<Ppaa, PpaaDto, PpaaDto> {
  protected readonly logger = new Logger(PpaasService.name);

  protected readonly relationCheckConfig = {
    relationFields: [''],
    errorMessage: 'Cannot delete Ppaa because it has associated: none.',
  };

  constructor(
    protected readonly ppaasRepository: PpaasRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(ppaasRepository, PpaaDto);
  }
}
