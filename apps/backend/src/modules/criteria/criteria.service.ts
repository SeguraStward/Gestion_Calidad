import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { ConflictException, Injectable, Logger } from '@nestjs/common';

import { CriterionDto } from './dtos/criterion.dto';
import { CreateCriterionDto } from './dtos/create-criterion.dto';
import { UpdateCriterionDto } from './dtos/update-criterion.dto';
import { Criterion } from '@una-gc/database/prisma/generated/client';
import { CriteriaRepository } from './criteria.repository';
import { PrismaService } from '@src/prisma/prisma.service';

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
    private readonly prisma: PrismaService,
  ) {
    super(criteriaRepository, CriterionDto);
  }

  /**
   * Hard-delete a criterion. The base check blocks the operation when there
   * are ACTIVE children, but Mongo's `Standard.criterionId` is a required
   * FK, so any leftover INACTIVE standard would still make Prisma refuse to
   * delete the parent. We cascade-clean those soft-deleted children first.
   * Also wipes the SinaesComplianceReport.criterionId pointers (the field is
   * optional, but leaving dangling ObjectIds is messy).
   */
  async deleteById(id: string): Promise<boolean> {
    // 1. Pull the criterion with its children so we can identify INACTIVE
    //    standards/evidences that need to be hard-removed.
    const criterion = await this.prisma.criterion.findUnique({
      where: { id },
      include: {
        standards: { include: { evidences: true } },
        evidences: true,
      },
    });

    // The base service will throw NotFoundException for us; just hand off.
    if (!criterion) return super.deleteById(id);

    const inactiveStandards = criterion.standards.filter((s) => s.status === 'INACTIVE');
    const inactiveDirectEvidences = criterion.evidences.filter((e) => e.status === 'INACTIVE');

    if (inactiveStandards.length || inactiveDirectEvidences.length) {
      this.logger.log(
        `Cascade-cleaning ${inactiveStandards.length} inactive standard(s) and ${inactiveDirectEvidences.length} inactive direct evidence(s) before deleting criterion ${id}`,
      );

      const inactiveStandardIds = inactiveStandards.map((s) => s.id);
      const evidencesUnderInactiveStandards = inactiveStandards.flatMap(
        (s: any) => (s.evidences ?? []) as Array<{ id: string }>,
      );
      const inactiveEvidenceIds = [
        ...inactiveDirectEvidences.map((e) => e.id),
        ...evidencesUnderInactiveStandards.map((e) => e.id),
      ];

      if (inactiveEvidenceIds.length) {
        // Detach proofDocuments and standardEvidences before deleting evidences.
        await this.prisma.careerProofDocument.deleteMany({
          where: { proofDocument: { evidenceId: { in: inactiveEvidenceIds } } },
        });
        await this.prisma.proofDocument.deleteMany({
          where: { evidenceId: { in: inactiveEvidenceIds } },
        });
        await this.prisma.standardEvidence.deleteMany({
          where: { evidenceId: { in: inactiveEvidenceIds } },
        });
        await this.prisma.qualityEvidence.deleteMany({
          where: { id: { in: inactiveEvidenceIds } },
        });
      }

      if (inactiveStandardIds.length) {
        await this.prisma.standardEvidence.deleteMany({
          where: { standardId: { in: inactiveStandardIds } },
        });
        await this.prisma.standard.deleteMany({
          where: { id: { in: inactiveStandardIds } },
        });
      }
    }

    // 3. Wipe references from any compliance report so the optional FK isn't
    //    left pointing into the void.
    await this.prisma.sinaesComplianceReport.updateMany({
      where: { criterionId: id },
      data: { criterionId: null },
    });

    // 4. Now let the base service run its normal check + delete.
    return super.deleteById(id);
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
