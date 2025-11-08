import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { ConflictException, Injectable, Logger } from '@nestjs/common';

import { StandardDto } from './dtos/standard.dto';
import { CreateStandardDto } from './dtos/create-standard.dto';
import { UpdateStandardDto } from './dtos/update-standard.dto';
import { Standard } from '@una-gc/database/prisma/generated/client';
import { StandardsRepository } from './standards.repository';

@Injectable()
export class StandardsService extends GenericService<Standard, StandardDto, CreateStandardDto, UpdateStandardDto> {
  protected readonly logger = new Logger(StandardsService.name);

  protected readonly relationCheckConfig = {
    relationFields: ['evidences', 'standardEvidences'],
    errorMessage: 'Cannot delete Standard because it has associated evidences.',
  };

  constructor(
    protected readonly standardsRepository: StandardsRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(standardsRepository, StandardDto);
  }

  async save(dto: CreateStandardDto): Promise<StandardDto> {
    // Validate unique name
    const exists = await this.standardsRepository.existsByName(dto.name);
    if (exists) {
      throw new ConflictException(`Ya existe un estándar con el nombre "${dto.name}"`);
    }
    return super.save(dto);
  }

  async update(id: string, dto: UpdateStandardDto): Promise<StandardDto> {
    // Validate unique name (excluding current entity)
    if (dto.name) {
      const exists = await this.standardsRepository.existsByName(dto.name, id);
      if (exists) {
        throw new ConflictException(`Ya existe un estándar con el nombre "${dto.name}"`);
      }
    }
    return super.update(id, dto);
  }
}
