import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { ConflictException, Injectable, Logger } from '@nestjs/common';

import { DimensionDto } from './dtos/dimension.dto';
import { CreateDimensionDto } from './dtos/create-dimension.dto';
import { UpdateDimensionDto } from './dtos/update-dimension.dto';
import { Dimension } from '@una-gc/database/prisma/generated/client';
import { DimensionsRepository } from './dimensions.repository';

@Injectable()
export class DimensionsService extends GenericService<Dimension, DimensionDto, CreateDimensionDto, UpdateDimensionDto> {
  protected readonly logger = new Logger(DimensionsService.name);

  protected readonly relationCheckConfig = {
    relationFields: ['components'],
    errorMessage: 'Cannot delete Dimension because it has associated components.',
  };

  constructor(
    protected readonly dimensionsRepository: DimensionsRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(dimensionsRepository, DimensionDto);
  }

  async save(dto: CreateDimensionDto): Promise<DimensionDto> {
    // Validate unique name
    const exists = await this.dimensionsRepository.existsByName(dto.name);
    if (exists) {
      throw new ConflictException(`Ya existe una dimensión con el nombre "${dto.name}"`);
    }
    return super.save(dto);
  }

  async update(id: string, dto: UpdateDimensionDto): Promise<DimensionDto> {
    // Validate unique name (excluding current entity)
    if (dto.name) {
      const exists = await this.dimensionsRepository.existsByName(dto.name, id);
      if (exists) {
        throw new ConflictException(`Ya existe una dimensión con el nombre "${dto.name}"`);
      }
    }
    return super.update(id, dto);
  }
}
