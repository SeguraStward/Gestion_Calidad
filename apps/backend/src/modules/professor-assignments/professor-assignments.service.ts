import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { DtoValidator } from '@core/common/dto-validator';
import { GenericService } from '@core/common/interfaces/generic.service';

import { ProfessorAssignmentsRepository } from './professor-assignments.repository';
import { CreateProfessorAssignmentDto } from './dtos/create-professor-assignment.dto';
import { ProfessorAssignmentDto, AssignmentType } from './dtos/professor-assignment.dto';
import { UpdateProfessorAssignmentDto } from './dtos/update-professor-assignment.dto';

import {
  ProfessorAssignment,
  Prisma,
  JourneyTimeType as PrismaJourneyTimeType,
} from '@una-gc/database/prisma/generated/client';

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

    const config = await this.prisma.journeyTimeCalculationConfig.findFirst({
      where: { isActive: true },
    });

    if (!config) {
      throw new BadRequestException('No hay configuracion activa de calculo');
    }

    const calculatedJourneyTime = this.calcJourney(payload.assignmentType, config);
    const assignmentType = payload.assignmentType as unknown as PrismaJourneyTimeType;

    const cleanPayload: Prisma.ProfessorAssignmentCreateInput = {
      professor: { connect: { id: payload.professorId } },
      academicCycle: { connect: { id: payload.academicCycleId } },
      campus: { connect: { id: payload.campusId } },
      assignmentType,
      calculatedJourneyTime,
      status: 'ACTIVE',
    };

    if (payload.campusAllocationId?.trim()) {
      const allocation = await this.prisma.campusJourneyTimeAllocation.findUnique({
        where: { id: payload.campusAllocationId },
      });

      if (allocation) {
        cleanPayload.campusAllocation = { connect: { id: payload.campusAllocationId } };
      } else {
        this.logger.warn(`Campus allocation ${payload.campusAllocationId} not found`);
      }
    }

    if (payload.curricularMeshCourseId?.trim()) {
      const course = await this.prisma.curricularMeshCourse.findUnique({
        where: { id: payload.curricularMeshCourseId },
      });

      if (course) {
        cleanPayload.curricularMeshCourse = { connect: { id: payload.curricularMeshCourseId } };
      } else {
        this.logger.warn(`Course ${payload.curricularMeshCourseId} not found, assignment will continue without course`);
      }
    }

    if (payload.institutionalProjectId?.trim()) {
      const project = await this.prisma.institutionalProject.findUnique({
        where: { id: payload.institutionalProjectId },
      });

      if (project) {
        cleanPayload.institutionalProject = { connect: { id: payload.institutionalProjectId } };
      } else {
        this.logger.warn(`Institutional project ${payload.institutionalProjectId} not found`);
      }
    }

    if (payload.notes?.trim()) {
      cleanPayload.notes = payload.notes;
    }

    const auditFields: any = {};
    if ((payload as any).createdBy) auditFields.createdBy = (payload as any).createdBy;
    if ((payload as any).updatedBy) auditFields.updatedBy = (payload as any).updatedBy;
    if ((payload as any).createdAt) auditFields.createdAt = (payload as any).createdAt;
    if ((payload as any).updatedAt) auditFields.updatedAt = (payload as any).updatedAt;

    const finalPayload = { ...cleanPayload, ...auditFields };

    try {
      const result = await this.prisma.professorAssignment.create({
        data: finalPayload,
        include: {
          professor: true,
          academicCycle: true,
          campus: true,
          curricularMeshCourse: {
            include: {
              course: true,
              curricularMesh: { include: { career: true } },
            },
          },
        },
      });

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
        updatedAt: result.updatedAt,
      } as any;
    } catch (error: any) {
      this.logger.error('Error creating professor assignment');
      this.logger.error('Message:', error.message);
      this.logger.error('Code:', error.code);
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

  async findAll(page = 1, limit = 10, where: any = {}, orderBy?: any, include?: any): Promise<any> {
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
