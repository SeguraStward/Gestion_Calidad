import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { ConflictException, Injectable, Logger } from '@nestjs/common';

import { CriterionDto } from './dtos/criterion.dto';
import { CreateCriterionDto } from './dtos/create-criterion.dto';
import { UpdateCriterionDto } from './dtos/update-criterion.dto';
import { Criterion } from '@una-gc/database/prisma/generated/client';
import { CriteriaRepository } from './criteria.repository';

@Injectable()
export class CriteriaService extends GenericService<Criterion, CriterionDto, CreateCriterionDto, UpdateCriterionDto> {
  protected readonly logger = new Logger(CriteriaService.name);

  protected readonly relationCheckConfig = {
    relationFields: ['standards', 'evidences'],
    errorMessage: (entity: any, counts: Record<string, number>) => {
      const parts: string[] = [];
      if (counts.standards > 0) parts.push(`${counts.standards} estándar(es)`);
      if (counts.evidences > 0) parts.push(`${counts.evidences} evidencia(s) directa(s)`);
      return `No se puede eliminar el criterio "${entity?.name ?? ''}" porque tiene ${parts.join(' y ')} activo(s) asociado(s). Elimina o desactiva los elementos hijos primero.`;
    },
  };

  constructor(
    protected readonly criteriaRepository: CriteriaRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(criteriaRepository, CriterionDto);
  }

  async save(dto: CreateCriterionDto): Promise<CriterionDto> {
    // Validate unique name
    const exists = await this.criteriaRepository.existsByName(dto.name);
    if (exists) {
      throw new ConflictException(`Ya existe un criterio con el nombre "${dto.name}"`);
    }
    return super.save(dto);
  }

  async update(id: string, dto: UpdateCriterionDto): Promise<CriterionDto> {
    // Validate unique name (excluding current entity)
    if (dto.name) {
      const exists = await this.criteriaRepository.existsByName(dto.name, id);
      if (exists) {
        throw new ConflictException(`Ya existe un criterio con el nombre "${dto.name}"`);
      }
    }
    return super.update(id, dto);
  }

  async findByComponent(componentId: string): Promise<CriterionDto[]> {
    const criteria = await this.criteriaRepository.findAll(1, 100, { componentId });
    return criteria.data;
  }
}
