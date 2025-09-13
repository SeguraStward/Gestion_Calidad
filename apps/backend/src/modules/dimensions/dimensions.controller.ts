import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { DimensionDto } from './dtos/dimension.dto';
import { CreateDimensionDto } from './dtos/create-dimension.dto';
import { UpdateDimensionDto } from './dtos/update-dimension.dto';
import { DimensionsService } from './dimensions.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';

@ResourceName('DIMENSION')
@Controller('dimensions')
export class DimensionsController extends GenericController<DimensionDto, CreateDimensionDto, UpdateDimensionDto> {
  protected readonly logger = new Logger(DimensionsController.name);
  protected readonly resourceName = 'DIMENSION';

  constructor(private readonly dimensionsService: DimensionsService) {
    super(dimensionsService);
  }
}
