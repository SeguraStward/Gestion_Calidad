import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { ComponentDto } from './dtos/component.dto';
import { CreateComponentDto } from './dtos/create-component.dto';
import { UpdateComponentDto } from './dtos/update-component.dto';
import { ComponentsService } from './components.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';

@ResourceName('COMPONENT')
@Controller('components')
export class ComponentsController extends GenericController<ComponentDto, CreateComponentDto, UpdateComponentDto> {
  protected readonly logger = new Logger(ComponentsController.name);
  protected readonly resourceName = 'COMPONENT';

  constructor(private readonly componentsService: ComponentsService) {
    super(componentsService);
  }
}
