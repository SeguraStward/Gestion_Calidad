import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { ComponentDto } from './dtos/component.dto';
import { CreateComponentDto } from './dtos/create-component.dto';
import { UpdateComponentDto } from './dtos/update-component.dto';
import { Component } from '@una-gc/database/prisma/generated/client';
import { ComponentsRepository } from './components.repository';

@Injectable()
export class ComponentsService extends GenericService<Component, ComponentDto, CreateComponentDto, UpdateComponentDto> {
  protected readonly logger = new Logger(ComponentsService.name);

  protected readonly relationCheckConfig = {
    relationFields: ['criteria'],
    errorMessage: 'Cannot delete Component because it has associated criteria.',
  };

  constructor(
    protected readonly componentsRepository: ComponentsRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(componentsRepository, ComponentDto);
  }
}
