import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { ConflictException, Injectable, Logger } from '@nestjs/common';

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

  async save(dto: CreateComponentDto): Promise<ComponentDto> {
    // Validate unique name
    const exists = await this.componentsRepository.existsByName(dto.name);
    if (exists) {
      throw new ConflictException(`Ya existe un componente con el nombre "${dto.name}"`);
    }
    return super.save(dto);
  }

  async update(id: string, dto: UpdateComponentDto): Promise<ComponentDto> {
    // Validate unique name (excluding current entity)
    if (dto.name) {
      const exists = await this.componentsRepository.existsByName(dto.name, id);
      if (exists) {
        throw new ConflictException(`Ya existe un componente con el nombre "${dto.name}"`);
      }
    }
    return super.update(id, dto);
  }
}
