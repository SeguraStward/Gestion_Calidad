import { Injectable, Logger } from '@nestjs/common';
import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { PrismaService } from '@src/prisma/prisma.service';

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
    private readonly prisma: PrismaService,
  ) {
    // OJO: tu GenericService espera (repository, DtoClass)
    super(repo, AnnualAllocationDto);
  }

  /**
   * 🔍 Override findAll para incluir datos poblados
   */
  async findAll(page = 1, limit = 10, where: any = {}, orderBy?: any, include?: any): Promise<any> {
    this.logger.debug('🎯 Custom findAll() called for AnnualAllocations');

    const allocations = await this.prisma.annualJourneyTimeAllocation.findMany({
      orderBy: { year: 'desc' },
    });

    const mapped = allocations.map((allocation) => ({
      id: allocation.id,
      year: allocation.year,
      totalJourneyTime: allocation.totalJourneyTime,
      status: allocation.status,
      createdAt: allocation.createdAt,
      updatedAt: allocation.updatedAt,
    }));

    this.logger.debug(`🎯 Returning ${mapped.length} annual allocations`);
    return { data: mapped as any, meta: { limit, page, total: mapped.length } };
  }

  /**
   * Obtener asignación activa
   */
  async getActive() {
    this.logger.log('Buscando asignación anual activa');

    const result = await this.repo.findAll();
    const active = result.data.find((a: any) => a.status === 'ACTIVE');

    if (!active) {
      this.logger.warn('No se encontró asignación activa');
      return null;
    }

    this.logger.log(`Asignación activa encontrada: ${active.id} (Año ${active.year})`);
    return active;
  }

  /**
   * Obtener resumen completo de un año
   */
  async getYearSummary(year: number) {
    const allocation: any = await this.repo.findByYear(year);
    if (!allocation) {
      return {
        year,
        found: false,
        message: `No se encontró asignación anual para el año ${year}`,
      };
    }

    // Calcular totales por campus
    const campusSummary = (allocation.campusAllocations || []).map((campus: any) => {
      const professorConsumed = (campus.professorAssignments || [])
        .filter((a: any) => a.status === 'ACTIVE')
        .reduce((sum: number, a: any) => sum + (a.calculatedJourneyTime || 0), 0);

      const projectsConsumed = (campus.institutionalProjects || [])
        .filter((p: any) => p.status === 'ACTIVE')
        .reduce((sum: number, p: any) => sum + p.assignedJourneyTime, 0);

      const totalConsumed = professorConsumed + projectsConsumed;
      const available = campus.allocatedJourneyTime + (campus.additionalJourneyTime || 0) - totalConsumed;

      return {
        campusId: campus.campusId,
        campusName: campus.campus?.name || 'N/A',
        curricularMesh: campus.curricularMesh?.name || 'N/A',
        academicCycle: campus.academicCycle?.name || 'N/A',
        allocated: campus.allocatedJourneyTime,
        additional: campus.additionalJourneyTime || 0,
        professorConsumed,
        projectsConsumed,
        totalConsumed,
        available: available < 0 ? 0 : available,
        status: campus.status,
      };
    });

    // Calcular totales externos
    const externalTotal = (allocation.externalProviders || [])
      .filter((p: any) => p.status === 'ACTIVE')
      .reduce((sum: number, p: any) => sum + p.providedJourneyTime, 0);

    // Totales generales
    const totalAllocatedToCampus = campusSummary.reduce((sum, c) => sum + c.allocated, 0);
    const totalAdditional = campusSummary.reduce((sum, c) => sum + c.additional, 0);
    const totalConsumed = campusSummary.reduce((sum, c) => sum + c.totalConsumed, 0);
    const totalAvailable = campusSummary.reduce((sum, c) => sum + c.available, 0);

    return {
      year,
      found: true,
      totalJourneyTime: allocation.totalJourneyTime,
      totalAllocatedToCampus,
      totalAdditional,
      totalFromExternalProviders: externalTotal,
      totalConsumed,
      totalAvailable,
      status: allocation.status,
      campusSummary,
      externalProviders: allocation.externalProviders.map((p: any) => ({
        id: p.id,
        name: p.name,
        providerType: p.providerType,
        providedJourneyTime: p.providedJourneyTime,
        status: p.status,
      })),
      summary: {
        totalCampus: campusSummary.length,
        totalExternalProviders: allocation.externalProviders.length,
        utilizationRate: totalAllocatedToCampus > 0 ? (totalConsumed / totalAllocatedToCampus) * 100 : 0,
      },
    };
  }

  // Si en tu dominio quieres recalcular disponibles cuando cambian totales,
  // puedes sobreescribir save/update y hacer los cálculos aquí.
  // async save(payload: CreateAnnualAllocationDto) { return super.save(payload); }
  // async update(id: string, payload: UpdateAnnualAllocationDto) { return super.update(id, payload); }
}
