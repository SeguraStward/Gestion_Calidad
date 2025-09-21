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

  // Recalcula availableTime = allocatedTime + additionalTime - baseTimeConsumed
  private computeAvailable(payload: Partial<CreateCampusAllocationDto | UpdateCampusAllocationDto>) {
    const allocated = Number(payload.allocatedTime ?? 0);
    const additional = Number(payload.additionalTime ?? 0);
    const consumed = Number(payload.baseTimeConsumed ?? 0);
    const available = allocated + additional - consumed;
    return available < 0 ? 0 : available;
  }

  // Opcional: asegurar consistencia de derived fields en create
  async save(payload: CreateCampusAllocationDto) {
    const withDerived = {
      ...payload,
      availableTime: this.computeAvailable(payload),
    };
    return super.save(withDerived as any);
  }

  // Opcional: asegurar consistencia de derived fields en update
  async update(id: string, payload: UpdateCampusAllocationDto) {
    const withDerived = {
      ...payload,
      availableTime: this.computeAvailable(payload),
    };
    return super.update(id, withDerived as any);
  }
}
