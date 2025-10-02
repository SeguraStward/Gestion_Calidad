import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';

import { ProfessorAssignmentsRepository } from './professor-assignments.repository';
import { ProfessorAssignmentDto } from './dtos/professor-assignment.dto';
import { CreateProfessorAssignmentDto } from './dtos/create-professor-assignment.dto';
import { UpdateProfessorAssignmentDto } from './dtos/update-professor-assignment.dto';

import { ProfessorAssignment, Prisma } from '@una-gc/database/prisma/generated/client';
import { PrismaService } from '@src/prisma/prisma.service';

@Injectable()
export class ProfessorAssignmentsService extends GenericService<
  ProfessorAssignment,
  ProfessorAssignmentDto,
  CreateProfessorAssignmentDto,
  UpdateProfessorAssignmentDto
> {
  protected readonly logger = new Logger(ProfessorAssignmentsService.name);

  constructor(
    protected readonly repo: ProfessorAssignmentsRepository,
    protected readonly dtoValidator: DtoValidator,
    private readonly prisma: PrismaService,
  ) {
    super(repo, ProfessorAssignmentDto);
  }

  // Sobreescribimos save con lógica de negocio
  async save(payload: CreateProfessorAssignmentDto) {
    // 1. Traer config activa
    const config = await this.prisma.journeyTimeCalculationConfig.findFirst({
      where: { isActive: true },
    });
    if (!config) throw new BadRequestException('No hay configuración activa de cálculo');

    // 2. Calcular tiempo según tipo
    const calcJourneyTime = this.calcJourney(payload, config);

    // 3. Buscar el campus allocation
    const campusAllocation = await this.prisma.campusJourneyTimeAllocation.findUnique({
      where: { id: payload.campusAllocationId },
    });
    if (!campusAllocation) throw new BadRequestException('Campus allocation no encontrado');

    if (campusAllocation.availableJourneyTime < calcJourneyTime) {
      throw new BadRequestException('No hay suficiente disponibilidad en el campus');
    }

    // 4. Descontar disponibilidad
    await this.prisma.campusJourneyTimeAllocation.update({
      where: { id: payload.campusAllocationId },
      data: {
        availableJourneyTime: campusAllocation.availableJourneyTime - calcJourneyTime,
      },
    });

    // 5. Guardar la asignación
    return super.save({ ...payload, calcJourneyTime } as any);
  }

  private calcJourney(payload: CreateProfessorAssignmentDto, config: any) {
    // ejemplo: usar horas + tipo para calcular carga
    if (payload.assignmentType === 'FULL') return config.fullTimeValue;
    if (payload.assignmentType === 'HALF') return config.halfTimeValue;
    if (payload.assignmentType === 'QUARTER') return config.quarterTimeValue;
    // fallback: 0
    return 0;
  }
}
