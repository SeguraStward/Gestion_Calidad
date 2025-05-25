import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { ParameterDto } from './dtos/parameter.dto';
import { Parameter } from '@una-gc/database/prisma/generated/client';
import { ParametersRepository } from './parameters.repository';

@Injectable()
export class ParametersService extends GenericService<Parameter, ParameterDto, ParameterDto> {
  protected readonly logger = new Logger(ParametersService.name);

  constructor(
    protected readonly parametersRepository: ParametersRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(parametersRepository, ParameterDto);
  }
}
