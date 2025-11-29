import { DtoValidator } from '@core/common/dto-validator';
import { GenericService } from '@core/common/interfaces/generic.service';
import { PaginatedResponse } from '@core/http/interfaces/paginated-response.interface';
import { Injectable, Logger } from '@nestjs/common';
import { AcademicLoad, Prisma, Status } from '@una-gc/database/prisma/generated/client';
import { PrismaService } from '@src/prisma/prisma.service';
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
    protected readonly prisma: PrismaService,
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

  /**
   * Bulk import academic loads from Excel
   * Creates schedules if they don't exist, finds professors by nationalId, finds courses by code
   */
  async bulkImportAcademicLoads(
    loads: Array<{
      numeroAula?: string;
      campus: string;
      ciclo: string;
      cupoDisponible: number;
      cupoMatricula: number;
      cupoMaximo: number;
      curso: string;
      grupo: string;
      horario?: string;
      nrc: string;
      profesorCedula: string;
    }>,
  ): Promise<{
    created: number;
    updated: number;
    errors: number;
    errorDetails: string[];
    loadIds: string[];
    stats: {
      professorsCreated: number;
      coursesFound: number;
      schedulesCreated: number;
      groupsFound: number;
    };
  }> {
    this.logger.debug(`[bulkImportAcademicLoads] Starting bulk import of ${loads.length} academic loads`);

    let created = 0;
    let updated = 0;
    let errors = 0;
    const errorDetails: string[] = [];
    const loadIds: string[] = [];
    const stats = {
      professorsCreated: 0,
      coursesFound: 0,
      schedulesCreated: 0,
      groupsFound: 0,
    };

    for (const load of loads) {
      try {
        const { numeroAula, campus, ciclo, cupoDisponible, cupoMatricula, cupoMaximo, curso, grupo, horario, nrc, profesorCedula } = load;

        // Validate required fields
        if (!campus || !ciclo || !curso || !grupo || !nrc || !profesorCedula) {
          errors++;
          errorDetails.push(`NRC ${nrc}: Datos incompletos`);
          continue;
        }

        // 1. Find or get Campus
        const campusRecord = await this.prisma.campus.findFirst({
          where: { name: { equals: campus.trim(), mode: 'insensitive' } },
        });

        if (!campusRecord) {
          errors++;
          errorDetails.push(`NRC ${nrc}: Campus "${campus}" no encontrado`);
          continue;
        }

        // 2. Find or get AcademicCycle
        const academicCycleRecord = await this.prisma.academicCycle.findFirst({
          where: { name: { equals: ciclo.trim(), mode: 'insensitive' } },
        });

        if (!academicCycleRecord) {
          errors++;
          errorDetails.push(`NRC ${nrc}: Ciclo académico "${ciclo}" no encontrado`);
          continue;
        }

        // 3. Find Course by code
        const courseRecord = await this.prisma.course.findFirst({
          where: { code: { equals: curso.trim(), mode: 'insensitive' } },
        });

        if (!courseRecord) {
          errors++;
          errorDetails.push(`NRC ${nrc}: Curso con código "${curso}" no encontrado`);
          continue;
        }
        stats.coursesFound++;

        // 4. Find or Create AcademicLoadGroup
        let groupRecord = await this.prisma.academicLoadGroup.findFirst({
          where: { number: { equals: grupo.trim(), mode: 'insensitive' } },
        });

        if (!groupRecord) {
          // Create new group if it doesn't exist
          try {
            groupRecord = await this.prisma.academicLoadGroup.create({
              data: {
                number: grupo.trim().toUpperCase(),
                status: Status.ACTIVE,
              },
            });
            stats.groupsFound++;
          } catch (error) {
            errors++;
            errorDetails.push(`NRC ${nrc}: Error al crear grupo "${grupo}": ${error instanceof Error ? error.message : String(error)}`);
            continue;
          }
        } else {
          stats.groupsFound++;
        }

        // 5. Find Professor by nationalId (cedula)
        const professorRecord = await this.prisma.user.findFirst({
          where: { nationalId: profesorCedula.trim() },
        });

        if (!professorRecord) {
          errors++;
          errorDetails.push(`NRC ${nrc}: Profesor con cédula "${profesorCedula}" no encontrado. Debe importar profesores primero.`);
          continue;
        }

        // 6. Handle Schedule (create if doesn't exist and horario is provided)
        let scheduleId: string | undefined = undefined;
        if (horario && horario.trim()) {
          // Try to find existing schedule
          const scheduleRecord = await this.prisma.schedule.findFirst({
            where: { name: { equals: horario.trim(), mode: 'insensitive' } },
          });

          if (scheduleRecord) {
            scheduleId = scheduleRecord.id;
          } else {
            // Create new schedule with the horario string as name
            // Note: day, startTime, endTime are required fields in schema
            // For now, using default values - should be parsed from horario string in production
            const newSchedule = await this.prisma.schedule.create({
              data: {
                name: horario.trim(),
                day: 'MONDAY', // TODO: Parse from horario string
                startTime: '08:00', // TODO: Parse from horario string
                endTime: '10:00', // TODO: Parse from horario string
              },
            });
            scheduleId = newSchedule.id;
            stats.schedulesCreated++;
          }
        }

        // 7. Handle Classroom (optional)
        let classroomId: string | undefined = undefined;
        if (numeroAula && numeroAula.trim()) {
          const classroomRecord = await this.prisma.classroom.findFirst({
            where: {
              roomNumber: { equals: numeroAula.trim(), mode: 'insensitive' },
              campusId: campusRecord.id,
            },
          });
          if (classroomRecord) {
            classroomId = classroomRecord.id;
          }
        }

        // 8. Check if Academic Load already exists by NRC
        const existingLoad = await this.prisma.academicLoad.findFirst({
          where: { nrc: nrc.trim() },
        });

        const loadData = {
          nrc: nrc.trim(),
          maximumCapacity: Number(cupoMaximo),
          enrolledCapacity: Number(cupoMatricula),
          availableSeats: Number(cupoDisponible),
          status: Status.ACTIVE,
        };

        if (existingLoad) {
          // Update existing load
          await this.prisma.academicLoad.update({
            where: { id: existingLoad.id },
            data: {
              ...loadData,
              academicCycle: { connect: { id: academicCycleRecord.id } },
              campus: { connect: { id: campusRecord.id } },
              course: { connect: { id: courseRecord.id } },
              group: { connect: { id: groupRecord.id } },
              professor: { connect: { id: professorRecord.id } },
              ...(classroomId && { classroom: { connect: { id: classroomId } } }),
              ...(scheduleId && { schedule: { connect: { id: scheduleId } } }),
            },
          });
          updated++;
          loadIds.push(existingLoad.id);
        } else {
          // Create new load
          const newLoad = await this.prisma.academicLoad.create({
            data: {
              ...loadData,
              academicCycle: { connect: { id: academicCycleRecord.id } },
              campus: { connect: { id: campusRecord.id } },
              course: { connect: { id: courseRecord.id } },
              group: { connect: { id: groupRecord.id } },
              professor: { connect: { id: professorRecord.id } },
              ...(classroomId && { classroom: { connect: { id: classroomId } } }),
              ...(scheduleId && { schedule: { connect: { id: scheduleId } } }),
            },
          });
          created++;
          loadIds.push(newLoad.id);
        }
      } catch (error) {
        errors++;
        const errorMsg = `NRC ${load.nrc}: ${error instanceof Error ? error.message : String(error)}`;
        errorDetails.push(errorMsg);
        this.logger.error(`[bulkImportAcademicLoads] ${errorMsg}`);
      }
    }

    this.logger.log(
      `[bulkImportAcademicLoads] Completed: ${created} created, ${updated} updated, ${errors} errors`,
    );

    return {
      created,
      updated,
      errors,
      errorDetails,
      loadIds,
      stats,
    };
  }
}
