import { Injectable, Logger } from '@nestjs/common';
import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';

import { CampusJourneyTimeAllocationsRepository } from './campus-journey-time-allocations.repository';
import { CampusAllocationDto } from './dtos/campus-allocation.dto';
import { CreateCampusAllocationDto } from './dtos/create-campus-allocation.dto';
import { UpdateCampusAllocationDto } from './dtos/update-campus-allocation.dto';

import { CampusJourneyTimeAllocation } from '@una-gc/database/prisma/generated/client';

@Injectable()
export class CampusJourneyTimeAllocationsService extends GenericService<
  CampusJourneyTimeAllocation,
  CampusAllocationDto,
  CreateCampusAllocationDto,
  UpdateCampusAllocationDto
> {
  protected readonly logger = new Logger(CampusJourneyTimeAllocationsService.name);

  // Evita borrar si hay consumos (professorAssignments, projects)
  protected readonly relationCheckConfig = {
    relationFields: ['professorAssignments', 'projects'],
    errorMessage: 'No se puede eliminar: tiene asignaciones/proyectos vinculados.',
  };

  constructor(
    protected readonly repo: CampusJourneyTimeAllocationsRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(repo, CampusAllocationDto);
  }

  // Recalcula availableJourneyTime = allocatedJourneyTime + additionalTime - baseJourneyTimeConsumed
  private computeAvailable(payload: Partial<CreateCampusAllocationDto | UpdateCampusAllocationDto>) {
    const allocated = Number(payload.allocatedJourneyTime ?? 0);
    const additional = Number(payload.additionalTime ?? 0);
    const consumed = Number(payload.baseJourneyTimeConsumed ?? 0);
    const available = allocated + additional - consumed;
    return available < 0 ? 0 : available;
  }

  async save(payload: CreateCampusAllocationDto) {
    const withDerived: any = {
      ...payload,
      availableJourneyTime: this.computeAvailable(payload),
      annualAllocation: { connect: { id: payload.annualAllocationId } },
    };
    return super.save(withDerived);
  }

  async update(id: string, payload: UpdateCampusAllocationDto) {
    const withDerived = {
      ...payload,
      availableJourneyTime: this.computeAvailable(payload),
    };
    return super.update(id, withDerived as any);
  }
}
