import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';

import { ProfessorAssignmentsRepository } from './professor-assignments.repository';
import { ProfessorAssignmentDto, AssignmentType } from './dtos/professor-assignment.dto';
import { CreateProfessorAssignmentDto } from './dtos/create-professor-assignment.dto';
import { UpdateProfessorAssignmentDto } from './dtos/update-professor-assignment.dto';

import {
  ProfessorAssignment,
  Prisma,
  JourneyTimeType as PrismaJourneyTimeType,
} from '@una-gc/database/prisma/generated/client';
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

  async save(payload: CreateProfessorAssignmentDto) {
    this.logger.debug('Received payload for professor assignment:', JSON.stringify(payload, null, 2));

    // Validar campos requeridos
    if (!payload.professorId?.trim()) {
      throw new BadRequestException('professorId es requerido');
    }
    if (!payload.academicCycleId?.trim()) {
      throw new BadRequestException('academicCycleId es requerido');
    }
    if (!payload.campusId?.trim()) {
      throw new BadRequestException('campusId es requerido');
    }
    if (!payload.assignmentType) {
      throw new BadRequestException('assignmentType es requerido');
    }

    // Obtener configuración activa
    this.logger.debug('➡️ Step 1: Fetching active config...');
    const config = await this.prisma.journeyTimeCalculationConfig.findFirst({
      where: { isActive: true },
    });
    if (!config) {
      this.logger.error('❌ No active config found');
      throw new BadRequestException('No hay configuración activa de cálculo');
    }
    this.logger.debug('✅ Config found:', { fullTimeValue: config.fullTimeValue, halfTimeValue: config.halfTimeValue });

    // Calcular tiempo de jornada
    const calculatedJourneyTime = this.calcJourney(payload.assignmentType, config);
    this.logger.debug(
      `Calculated journey time ${calculatedJourneyTime} for assignment type ${payload.assignmentType}`,
    );

    const assignmentType = payload.assignmentType as unknown as PrismaJourneyTimeType;

    // Construir payload limpio con campos directos
    const cleanPayload: Prisma.ProfessorAssignmentCreateInput = {
      professor: { connect: { id: payload.professorId } },
      academicCycle: { connect: { id: payload.academicCycleId } },
      campus: { connect: { id: payload.campusId } },
      assignmentType,
      calculatedJourneyTime,
      status: 'ACTIVE',
    };

    // Campos opcionales con validación
    if (payload.campusAllocationId?.trim()) {
      this.logger.debug('➡️ Step 2: Checking campus allocation:', payload.campusAllocationId);
      const allocation = await this.prisma.campusJourneyTimeAllocation.findUnique({
        where: { id: payload.campusAllocationId },
      });
      if (allocation) {
        this.logger.debug('✅ Campus allocation found');
        cleanPayload.campusAllocation = { connect: { id: payload.campusAllocationId } };
      } else {
        this.logger.warn(`⚠️ Campus allocation ${payload.campusAllocationId} not found, skipping`);
      }
    }

    // ✅ CURSO ES OPCIONAL (no todos los registros tienen curso asignado)
    if (payload.curricularMeshCourseId?.trim()) {
      this.logger.debug('➡️ Step 3: Checking course:', payload.curricularMeshCourseId);
      const course = await this.prisma.curricularMeshCourse.findUnique({
        where: { id: payload.curricularMeshCourseId },
      });

      if (!course) {
        this.logger.warn(`⚠️ Course not found: ${payload.curricularMeshCourseId} - Assignment will be created without specific course`);
        // No conectamos el curso si no existe, simplemente lo dejamos null
      } else {
        this.logger.debug('✅ Course found:', { id: course.id, courseId: course.courseId });
        cleanPayload.curricularMeshCourse = { connect: { id: payload.curricularMeshCourseId } };
      }
    } else {
      this.logger.debug('ℹ️ No course ID provided - creating assignment without specific course');
    }

    if (payload.institutionalProjectId?.trim()) {
      const project = await this.prisma.institutionalProject.findUnique({
        where: { id: payload.institutionalProjectId },
      });
      if (project) {
        cleanPayload.institutionalProject = { connect: { id: payload.institutionalProjectId } };
      } else {
        this.logger.warn(`Institutional project ${payload.institutionalProjectId} not found, skipping`);
      }
    }

    if (payload.notes?.trim()) {
      cleanPayload.notes = payload.notes;
    }

    // Agregar campos de auditoría si vienen en el payload
    const auditFields: any = {};
    if ((payload as any).createdBy) {
      auditFields.createdBy = (payload as any).createdBy;
    }
    if ((payload as any).updatedBy) {
      auditFields.updatedBy = (payload as any).updatedBy;
    }
    if ((payload as any).createdAt) {
      auditFields.createdAt = (payload as any).createdAt;
    }
    if ((payload as any).updatedAt) {
      auditFields.updatedAt = (payload as any).updatedAt;
    }

    const finalPayload = { ...cleanPayload, ...auditFields };

    this.logger.debug('➡️ Step 4: Final payload structure:');
    this.logger.debug(JSON.stringify(finalPayload, null, 2));
    
    try {
      this.logger.debug('➡️ Step 5: Calling Prisma create...');
      const result = await this.prisma.professorAssignment.create({
        data: finalPayload,
        include: {
          professor: true,
          academicCycle: true,
          campus: true,
          curricularMeshCourse: {
            include: {
              course: true,
              curricularMesh: { include: { career: true } }
            }
          }
        }
      });
      
      this.logger.debug('✅✅✅ Assignment created successfully! ID:', result.id);
      
      // Mapear al DTO esperado
      return {
        id: result.id,
        professorId: result.professorId,
        professorName: result.professor?.fullName,
        professorIdentification: result.professor?.nationalId,
        academicCycleId: result.academicCycleId,
        cycleName: result.academicCycle?.name,
        campusId: result.campusId,
        campusName: result.campus?.name,
        careerName: result.curricularMeshCourse?.curricularMesh?.career?.name,
        assignmentType: result.assignmentType as any,
        calculatedJourneyTime: result.calculatedJourneyTime,
        status: result.status,
        notes: result.notes,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt
      } as any;
    } catch (error: any) {
      this.logger.error('❌❌❌ PRISMA ERROR DETAILS:');
      this.logger.error('Error message:', error.message);
      this.logger.error('Error code:', error.code);
      this.logger.error('Error meta:', JSON.stringify(error.meta, null, 2));
      this.logger.error('Full error object:', JSON.stringify(error, null, 2));
      this.logger.error('Stack trace:', error.stack);
      throw error;
    }
  }

  private calcJourney(assignmentType: AssignmentType, config: any): number {
    switch (assignmentType) {
      case AssignmentType.FULL:
        return config.fullTimeValue;
      case AssignmentType.HALF:
        return config.halfTimeValue;
      case AssignmentType.QUARTER:
        return config.quarterTimeValue;
      case AssignmentType.THREE_QUARTER:
        return config.threeQuarterTimeValue ?? 0.75;
      default:
        return 0;
    }
  }

  // Sobrescribir findAll para incluir relaciones
  async findAll(page = 1, limit = 10, where: any = {}, orderBy?: any, include?: any): Promise<any> {
    this.logger.debug('🔍 findAll() called - fetching assignments with relations');

    const assignments = await this.prisma.professorAssignment.findMany({
      include: {
        professor: true,
        academicCycle: true,
        campus: true,
        curricularMeshCourse: {
          include: {
            course: true,
            curricularMesh: {
              include: {
                career: true,
              },
            },
          },
        },
      },
    });

    this.logger.debug(`📦 Found ${assignments.length} assignments from DB`);

    const mapped = assignments.map((assignment) => ({
      id: assignment.id,
      professorId: assignment.professorId,
      professorName: assignment.professor?.fullName || 'Sin nombre',
      professorIdentification: assignment.professor?.nationalId || '',
      academicCycleId: assignment.academicCycleId,
      cycleName: assignment.academicCycle?.name || 'Sin ciclo',
      campusId: assignment.campusId,
      campusName: assignment.campus?.name || 'Sin campus',
      careerName: assignment.curricularMeshCourse?.curricularMesh?.career?.name || 'Sin carrera',
      assignmentType: assignment.assignmentType as any,
      calculatedJourneyTime: assignment.calculatedJourneyTime,
      status: assignment.status,
      notes: assignment.notes,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
    }));

    this.logger.debug(`📤 Returning ${mapped.length} mapped assignments`);

    return {
      data: mapped as any,
      meta: {
        limit,
        page,
        total: mapped.length,
      },
    };
  }
}
