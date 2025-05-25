import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { ParameterDto } from './dtos/parameter.dto';
import { ParametersService } from './parameters.service';

@Controller('parameters')
export class ParametersController extends GenericController<ParameterDto, ParameterDto> {
  protected readonly logger = new Logger(ParametersController.name);
  constructor(private readonly parametersService: ParametersService) {
    super(parametersService);
  }
}
