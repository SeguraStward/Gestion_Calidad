import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { ConflictException, Injectable, Logger } from '@nestjs/common';

import { QualityEvidenceDto } from './dtos/quality-evidence.dto';
import { CreateQualityEvidenceDto } from './dtos/create-quality-evidence.dto';
import { UpdateQualityEvidenceDto } from './dtos/update-quality-evidence.dto';
import { QualityEvidence } from '@una-gc/database/prisma/generated/client';
import { QualityEvidencesRepository } from './quality-evidences.repository';

@Injectable()
export class QualityEvidencesService extends GenericService<QualityEvidence, QualityEvidenceDto, CreateQualityEvidenceDto, UpdateQualityEvidenceDto> {
  protected readonly logger = new Logger(QualityEvidencesService.name);

  protected readonly relationCheckConfig = {
    relationFields: ['proofDocuments', 'standardEvidences'],
    errorMessage: 'Cannot delete Quality Evidence because it has associated proof documents or standard evidences.',
  };

  constructor(
    protected readonly qualityEvidencesRepository: QualityEvidencesRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(qualityEvidencesRepository, QualityEvidenceDto);
  }

  async save(dto: CreateQualityEvidenceDto): Promise<QualityEvidenceDto> {
    // Validate unique name
    const exists = await this.qualityEvidencesRepository.existsByName(dto.name);
    if (exists) {
      throw new ConflictException(`Ya existe una evidencia de calidad con el nombre "${dto.name}"`);
    }
    return super.save(dto);
  }

  async update(id: string, dto: UpdateQualityEvidenceDto): Promise<QualityEvidenceDto> {
    // Validate unique name (excluding current entity)
    if (dto.name) {
      const exists = await this.qualityEvidencesRepository.existsByName(dto.name, id);
      if (exists) {
        throw new ConflictException(`Ya existe una evidencia de calidad con el nombre "${dto.name}"`);
      }
    }
    return super.update(id, dto);
  }
}
