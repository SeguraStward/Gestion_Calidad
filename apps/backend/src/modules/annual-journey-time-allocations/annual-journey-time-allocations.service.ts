import { Injectable, Logger } from '@nestjs/common';
import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';

import { AnnualJourneyTimeAllocationsRepository } from './annual-journey-time-allocations.repository';
import { AnnualAllocationDto } from './dtos/annual-allocation.dto';
import { CreateAnnualAllocationDto } from './dtos/create-annual-allocation.dto';
import { UpdateAnnualAllocationDto } from './dtos/update-annual-allocation.dto';

import { AnnualJourneyTimeAllocation } from '@una-gc/database/prisma/generated/client';

@Injectable()
export class AnnualJourneyTimeAllocationsService extends GenericService<
  AnnualJourneyTimeAllocation,
  AnnualAllocationDto,
  CreateAnnualAllocationDto,
  UpdateAnnualAllocationDto
> {
  protected readonly logger = new Logger(AnnualJourneyTimeAllocationsService.name);

  protected readonly relationCheckConfig = {
    relationFields: ['campusAllocations', 'externalProviders'],
    errorMessage: 'No se puede eliminar: tiene partidas de campus o proveedores externos vinculados.',
  };

  constructor(
    protected readonly repo: AnnualJourneyTimeAllocationsRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    // OJO: tu GenericService espera (repository, DtoClass)
    super(repo, AnnualAllocationDto);
  }

  // Si en tu dominio quieres recalcular disponibles cuando cambian totales,
  // puedes sobreescribir save/update y hacer los cálculos aquí.
  // async save(payload: CreateAnnualAllocationDto) { return super.save(payload); }
  // async update(id: string, payload: UpdateAnnualAllocationDto) { return super.update(id, payload); }
}
