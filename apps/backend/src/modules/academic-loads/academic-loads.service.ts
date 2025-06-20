// src/modules/academic-loads/academic-loads.service.ts
import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';
import { AcademicLoadDto } from './dtos/academic-load.dto';
import { AcademicLoad, Prisma, Status } from '@una-gc/database/prisma/generated/client';
import { AcademicLoadsRepository } from './academic-loads.repository';
import { PaginatedResponse } from '@core/http/interfaces/paginated-response.interface';

// Define full include object for relations
const FULL_INCLUDE: Prisma.AcademicLoadInclude = {
  academicCycle: true,
  campus: true,
  course: true,
  classroom: true,
  group: true,
  schedule: true,
  professor: {
    select: {
      id: true,
      fullName: true,
      fullLastName: true,
      email: true,
      photoUrl: true,
      status: true,
    },
  },
  finalReports: true,
};

@Injectable()
export class AcademicLoadsService extends GenericService<AcademicLoad, AcademicLoadDto, AcademicLoadDto> {
  protected readonly logger = new Logger(AcademicLoadsService.name);

  protected readonly relationCheckConfig = {
    relationFields: [''],
    errorMessage: 'Cannot delete AcademicLoad because it has associated: none.',
  };

  constructor(
    protected readonly academicLoadsRepository: AcademicLoadsRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(academicLoadsRepository, AcademicLoadDto, dtoValidator);
  }

  // Override save to handle relations properly
  async save(payload: AcademicLoadDto): Promise<AcademicLoadDto> {
    this.logger.debug(`Saving academic load with payload: ${JSON.stringify(payload)}`);
    // Calculate available seats
    const availableSeats = payload.maximumCapacity - payload.enrolledCapacity;
    const data: Prisma.AcademicLoadCreateInput = {
      ...payload,
      availableSeats,
      academicCycle: { connect: { id: payload.academicCycleId } },
      campus: { connect: { id: payload.campusId } },
      course: { connect: { id: payload.courseId } },
      group: { connect: { id: payload.groupId } },
      professor: { connect: { id: payload.professorId } },
      ...(payload.classroomId && { classroom: { connect: { id: payload.classroomId } } }),
      ...(payload.scheduleId && { schedule: { connect: { id: payload.scheduleId } } }),
    };
    return super.save(data as any);
  }

  // Override update to handle relations properly
  async update(id: string, payload: Partial<AcademicLoadDto>): Promise<AcademicLoadDto> {
    this.logger.debug(`Updating academic load ${id} with payload: ${JSON.stringify(payload)}`);
    // Calculate available seats if capacity fields are being updated
    let availableSeats: number | undefined;
    if (payload.maximumCapacity !== undefined || payload.enrolledCapacity !== undefined) {
      const current = await this.findById(id);
      const maxCapacity = payload.maximumCapacity ?? current?.maximumCapacity ?? 0;
      const enrolled = payload.enrolledCapacity ?? current?.enrolledCapacity ?? 0;
      availableSeats = maxCapacity - enrolled;
    }
    const data: Prisma.AcademicLoadUpdateInput = {
      ...payload,
      ...(availableSeats !== undefined && { availableSeats }),
      ...(payload.academicCycleId && { academicCycle: { connect: { id: payload.academicCycleId } } }),
      ...(payload.campusId && { campus: { connect: { id: payload.campusId } } }),
      ...(payload.courseId && { course: { connect: { id: payload.courseId } } }),
      ...(payload.groupId && { group: { connect: { id: payload.groupId } } }),
      ...(payload.professorId && { professor: { connect: { id: payload.professorId } } }),
      ...(payload.classroomId && { classroom: { connect: { id: payload.classroomId } } }),
      ...(payload.scheduleId && { schedule: { connect: { id: payload.scheduleId } } }),
    };
    return super.update(id, data as any);
  }

  // Override findById to include all relations
  async findById(id: string): Promise<AcademicLoadDto | null> {
    return this.academicLoadsRepository.findById(id, FULL_INCLUDE) as any;
  }

  // Override findAll to include all relations
  async findAll(
    page = 1,
    limit = 10,
    where?: Prisma.AcademicLoadWhereInput,
    orderBy?: Prisma.AcademicLoadOrderByWithRelationInput,
  ): Promise<PaginatedResponse<AcademicLoadDto>> {
    return super.findAll(page, limit, where, orderBy, FULL_INCLUDE);
  }

  // Custom method for finding by professor
  async findAllByProfessorId(
    professorId: string,
    page = 1,
    limit = 10,
    status?: Status,
    orderBy?: Prisma.AcademicLoadOrderByWithRelationInput,
  ): Promise<PaginatedResponse<AcademicLoadDto>> {
    const where: Prisma.AcademicLoadWhereInput = {
      professorId,
      ...(status && { status }),
    };
    return super.findAll(page, limit, where, orderBy, FULL_INCLUDE);
  }
}
