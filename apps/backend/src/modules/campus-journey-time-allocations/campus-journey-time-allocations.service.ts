import { Injectable, Logger } from '@nestjs/common';
import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { PrismaService } from '@src/prisma/prisma.service';

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
    private readonly prisma: PrismaService,
  ) {
    super(repo, CampusAllocationDto);
  }

  /**
   * 🔍 Override findAll para incluir relaciones pobladas
   */
  async findAll(page = 1, limit = 10, where: any = {}, orderBy?: any, include?: any): Promise<any> {
    this.logger.debug('🎯 Custom findAll() called with includes');

    const allocations = await this.prisma.campusJourneyTimeAllocation.findMany({
      include: {
        campus: true,
        academicCycle: true,
        curricularMesh: {
          include: {
            career: true,
          },
        },
      },
    });

    const mapped = allocations.map((allocation) => ({
      id: allocation.id,
      campusName: allocation.campus?.name || 'Sin campus',
      campusId: allocation.campusId,
      cycleName: allocation.academicCycle?.name || 'Sin ciclo',
      academicCycleId: allocation.academicCycleId,
      careerName: allocation.curricularMesh?.career?.name,
      careerId: allocation.curricularMesh?.career?.id,
      description: allocation.description,
      totalAllocatedTime: allocation.allocatedJourneyTime,
      additionalTime: allocation.additionalJourneyTime || 0,
      availableTime: allocation.availableJourneyTime || 0,
      status: allocation.status,
      createdAt: allocation.createdAt,
      updatedAt: allocation.updatedAt,
    }));

    this.logger.debug(`🎯 Returning ${mapped.length} campus allocations with populated data`);
    return { data: mapped as any, meta: { limit, page, total: mapped.length } };
  }

  async findByIdRaw(id: string) {
    return this.repo.findById(id);
  }

  // Recalcula availableJourneyTime = allocatedJourneyTime + additionalTime - baseJourneyTimeConsumed
  private computeAvailable(input: {
    allocatedJourneyTime?: number;
    additionalTime?: number;
    baseJourneyTimeConsumed?: number;
  }) {
    const allocated = Number(input.allocatedJourneyTime ?? 0);
    const additional = Number(input.additionalTime ?? 0);
    const consumed = Number(input.baseJourneyTimeConsumed ?? 0);
    const available = allocated + additional - consumed;
    return available < 0 ? 0 : available;
  }

  async save(payload: CreateCampusAllocationDto) {
    const withDerived: any = {
      annualAllocationId: payload.annualAllocationId,
      campusId: payload.campusId,
      academicCycleId: payload.cycleId,
      ...(payload.meshId ? { curricularMeshId: payload.meshId } : {}),
      allocatedJourneyTime: payload.allocatedJourneyTime,
      baseJourneyTimeConsumed: payload.baseJourneyTimeConsumed ?? 0,
      additionalJourneyTime: payload.additionalTime ?? 0,
      status: payload.status,
      description: payload.description,
      availableJourneyTime: this.computeAvailable(payload),
    };
    return super.save(withDerived);
  }

  async update(id: string, payload: UpdateCampusAllocationDto) {
    const current: any = await this.repo.findById(id);

    const withDerived: any = {
      ...(payload.annualAllocationId ? { annualAllocationId: payload.annualAllocationId } : {}),
      ...(payload.campusId ? { campusId: payload.campusId } : {}),
      ...(payload.cycleId ? { academicCycleId: payload.cycleId } : {}),
      ...(payload.meshId !== undefined ? { curricularMeshId: payload.meshId || null } : {}),
      ...(payload.allocatedJourneyTime !== undefined ? { allocatedJourneyTime: payload.allocatedJourneyTime } : {}),
      ...(payload.baseJourneyTimeConsumed !== undefined ? { baseJourneyTimeConsumed: payload.baseJourneyTimeConsumed } : {}),
      ...(payload.additionalTime !== undefined ? { additionalJourneyTime: payload.additionalTime } : {}),
      ...(payload.status ? { status: payload.status } : {}),
      ...(payload.description !== undefined ? { description: payload.description } : {}),
      availableJourneyTime: this.computeAvailable({
        allocatedJourneyTime: payload.allocatedJourneyTime ?? current.allocatedJourneyTime,
        additionalTime: payload.additionalTime ?? current.additionalJourneyTime,
        baseJourneyTimeConsumed: payload.baseJourneyTimeConsumed ?? current.baseJourneyTimeConsumed,
      }),
    };
    return super.update(id, withDerived as any);
  }

  /**
   * Calcular tiempo disponible en tiempo real
   * Considera asignaciones de profesores y proyectos institucionales
   */
  async calculateAvailableTime(id: string) {
    const allocation: any = await this.repo.findById(id, {
      professorAssignments: true,
      institutionalProjects: true,
    });

    // Calcular tiempo consumido por profesores
    const professorConsumed = (allocation.professorAssignments || [])
      .filter((a: any) => a.status === 'ACTIVE')
      .reduce((sum: number, assignment: any) => sum + (assignment.calculatedJourneyTime || 0), 0);

    // Calcular tiempo consumido por proyectos
    const projectsConsumed = (allocation.institutionalProjects || [])
      .filter((p: any) => p.status === 'ACTIVE')
      .reduce((sum: number, project: any) => sum + project.assignedJourneyTime, 0);

    const totalConsumed = professorConsumed + projectsConsumed;
    const available =
      allocation.allocatedJourneyTime + (allocation.additionalJourneyTime || 0) - totalConsumed;

    return {
      campusAllocationId: id,
      allocatedJourneyTime: allocation.allocatedJourneyTime,
      additionalJourneyTime: allocation.additionalJourneyTime || 0,
      totalAvailable: allocation.allocatedJourneyTime + (allocation.additionalJourneyTime || 0),
      professorConsumed,
      projectsConsumed,
      totalConsumed,
      availableJourneyTime: available < 0 ? 0 : available,
      status: allocation.status,
    };
  }

  /**
   * Validar si hay suficiente tiempo disponible para una nueva asignación
   */
  async validateAvailability(id: string, requestedTime: number) {
    const availability = await this.calculateAvailableTime(id);

    const isAvailable = availability.availableJourneyTime >= requestedTime;
    const deficit = isAvailable ? 0 : requestedTime - availability.availableJourneyTime;

    return {
      isAvailable,
      requestedTime,
      availableTime: availability.availableJourneyTime,
      deficit,
      message: isAvailable
        ? `✅ Hay ${availability.availableJourneyTime} horas disponibles (se solicitan ${requestedTime})`
        : `❌ Insuficiente: faltan ${deficit} horas (disponible: ${availability.availableJourneyTime}, solicitado: ${requestedTime})`,
      details: availability,
    };
  }
}
