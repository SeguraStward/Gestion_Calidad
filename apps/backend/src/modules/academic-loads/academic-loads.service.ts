import { DtoValidator } from '@core/common/dto-validator';
import { GenericService } from '@core/common/interfaces/generic.service';
import { PaginatedResponse } from '@core/http/interfaces/paginated-response.interface';
import { Injectable, Logger } from '@nestjs/common';
import { AcademicLoad, Prisma, Status } from '@una-gc/database/prisma/generated/client';
import { AcademicLoadsRepository } from './academic-loads.repository';
import { AcademicLoadDto } from './dtos/academic-load.dto';

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

  // No relation checks needed for Academic Load deletion
  protected readonly relationCheckConfig = {
    relationFields: [],
    errorMessage: '',
  };

  constructor(
    protected readonly academicLoadsRepository: AcademicLoadsRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(academicLoadsRepository, AcademicLoadDto, dtoValidator);
  }

  // Override save to handle relations properly
  override async save(payload: AcademicLoadDto): Promise<AcademicLoadDto> {
    this.logger.debug(`Saving academic load with payload: ${JSON.stringify(payload)}`);

    // Ensure numeric fields are properly converted
    const maximumCapacity = Number(payload.maximumCapacity);
    const enrolledCapacity = Number(payload.enrolledCapacity);

    // Calculate available seats
    const availableSeats = maximumCapacity - enrolledCapacity;

    // Process date - ensure it's a proper Date object or undefined
    let processedDate: Date | undefined;
    if (payload.date !== undefined && payload.date !== null) {
      if (typeof payload.date === 'string') {
        // If it's a string, parse it and ensure it has time component
        const dateStr = (payload.date as string).match(/^\d{4}-\d{2}-\d{2}$/)
          ? payload.date + 'T00:00:00.000Z'
          : payload.date;
        const tempDate = new Date(dateStr);
        processedDate = isNaN(tempDate.getTime()) ? undefined : tempDate;
      } else if (payload.date instanceof Date) {
        processedDate = isNaN(payload.date.getTime()) ? undefined : payload.date;
      } else {
        const tempDate = new Date(payload.date as any);
        processedDate = isNaN(tempDate.getTime()) ? undefined : tempDate;
      }
    }

    // Create clean data object without relation IDs (they will be handled by connect)
    const data: Prisma.AcademicLoadCreateInput = {
      nrc: payload.nrc,
      maximumCapacity,
      enrolledCapacity,
      availableSeats,
      status: payload.status,
      ...(processedDate && { date: processedDate }),

      // Handle relations with connect
      academicCycle: { connect: { id: payload.academicCycleId } },
      campus: { connect: { id: payload.campusId } },
      course: { connect: { id: payload.courseId } },
      group: { connect: { id: payload.groupId } },
      professor: { connect: { id: payload.professorId } },
      ...(payload.classroomId && { classroom: { connect: { id: payload.classroomId } } }),
      ...(payload.scheduleId && { schedule: { connect: { id: payload.scheduleId } } }),
    };

    // Create the entity and then fetch it with includes to ensure all relations are loaded
    const created = (await this.academicLoadsRepository.save(data as any)) as AcademicLoad;
    // Fetch the created item with full includes
    return (await this.findById(created.id)) as AcademicLoadDto;
  }

  // Override update to handle relations properly
  override async update(id: string, payload: Partial<AcademicLoadDto>): Promise<AcademicLoadDto> {
    this.logger.debug(`Updating academic load ${id} with payload: ${JSON.stringify(payload)}`);

    // Calculate available seats if capacity fields are being updated
    let availableSeats: number | undefined;
    if (payload.maximumCapacity !== undefined || payload.enrolledCapacity !== undefined) {
      const current = await this.findById(id);
      const maxCapacity = Number(payload.maximumCapacity ?? current?.maximumCapacity ?? 0);
      const enrolled = Number(payload.enrolledCapacity ?? current?.enrolledCapacity ?? 0);
      availableSeats = maxCapacity - enrolled;
    }

    // Process date - ensure it's a proper Date object
    let processedDate: Date | undefined;
    if (payload.date !== undefined) {
      if (payload.date === null) {
        processedDate = undefined;
      } else if (typeof payload.date === 'string') {
        processedDate = new Date(payload.date + 'T00:00:00.000Z');
      } else if (payload.date instanceof Date) {
        processedDate = payload.date;
      } else {
        processedDate = new Date(payload.date);
      }
    }

    // Create clean data object
    const data: Prisma.AcademicLoadUpdateInput = {
      ...(payload.nrc !== undefined && { nrc: payload.nrc }),
      ...(payload.maximumCapacity !== undefined && { maximumCapacity: Number(payload.maximumCapacity) }),
      ...(payload.enrolledCapacity !== undefined && { enrolledCapacity: Number(payload.enrolledCapacity) }),
      ...(payload.status !== undefined && { status: payload.status }),
      ...(availableSeats !== undefined && { availableSeats }),
      ...(processedDate !== undefined && { date: processedDate }),

      // Handle relations with connect
      ...(payload.academicCycleId && { academicCycle: { connect: { id: payload.academicCycleId } } }),
      ...(payload.campusId && { campus: { connect: { id: payload.campusId } } }),
      ...(payload.courseId && { course: { connect: { id: payload.courseId } } }),
      ...(payload.groupId && { group: { connect: { id: payload.groupId } } }),
      ...(payload.professorId && { professor: { connect: { id: payload.professorId } } }),
      ...(payload.classroomId && { classroom: { connect: { id: payload.classroomId } } }),
      ...(payload.scheduleId && { schedule: { connect: { id: payload.scheduleId } } }),
    };

    // Update the entity and then fetch it with includes to ensure all relations are loaded
    await this.academicLoadsRepository.update(id, data as any);
    // Fetch the updated item with full includes
    return (await this.findById(id)) as AcademicLoadDto;
  }

  // Override findById to include all relations
  override async findById(id: string): Promise<AcademicLoadDto | null> {
    return this.academicLoadsRepository.findById(id, FULL_INCLUDE) as any;
  }

  // Override findAll to include all relations
  override async findAll(
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

  // Override delete method to handle any specific logic if needed
  override async delete(id: string): Promise<boolean> {
    this.logger.debug(`Deleting academic load with id: ${id}`);

    // First, check if the record exists
    const existingItem = await this.findById(id);
    if (!existingItem) {
      throw new Error(`Academic Load with id ${id} not found`);
    }

    // Perform the deletion
    return super.delete(id);
  }
}
