import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { PpaaDto } from './dtos/ppaa.dto';
import { PpaasService } from './ppaas.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';

@ResourceName('PPAAS')
@Controller('ppaas')
export class PpaasController extends GenericController<PpaaDto, PpaaDto> {
  protected readonly logger = new Logger(PpaasController.name);
  protected readonly resourceName = 'PPAAS';
  constructor(private readonly ppaasService: PpaasService) {
    super(ppaasService);
  }
}
