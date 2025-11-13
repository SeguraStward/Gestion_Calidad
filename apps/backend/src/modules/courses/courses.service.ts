import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { CourseDto } from './dtos/course.dto';
import { Course, Status } from '@una-gc/database/prisma/generated/client';
import { CoursesRepository } from './courses.repository';
import { PrismaService } from '@src/prisma/prisma.service';

@Injectable()
export class CoursesService extends GenericService<Course, CourseDto, CourseDto> {
  protected readonly logger = new Logger(CoursesService.name);

  protected readonly relationCheckConfig = {
    relationFields: ['academicLoads'],
    errorMessage: 'Cannot delete Course because it has associated: academicLoads.',
  };

  constructor(
    protected readonly coursesRepository: CoursesRepository,
    protected readonly dtoValidator: DtoValidator,
    private readonly prisma: PrismaService,
  ) {
    super(coursesRepository, CourseDto);
  }

  /**
   * Bulk import courses from Excel
   * Creates courses if they don't exist, updates if they do
   */
  async bulkImportCourses(
    courses: Array<{
      codigo: string;
      nombre: string;
      creditos: number;
      nivel: number;
      horasContacto: number;
      horasIndependientes?: number;
      descripcion?: string;
    }>,
  ): Promise<{
    created: number;
    updated: number;
    errors: number;
    errorDetails: string[];
    courseIds: string[];
  }> {
    this.logger.debug(`[bulkImportCourses] Starting bulk import of ${courses.length} courses`);

    let created = 0;
    let updated = 0;
    let errors = 0;
    const errorDetails: string[] = [];
    const courseIds: string[] = [];

    for (const course of courses) {
      try {
        const { codigo, nombre, creditos, nivel, horasContacto, horasIndependientes, descripcion } = course;

        // Validate required fields
        if (!codigo || !nombre || !creditos || !nivel || !horasContacto) {
          errors++;
          errorDetails.push(`Curso ${codigo || 'sin código'}: Datos incompletos`);
          continue;
        }

        // Check if course exists by code
        const existingCourse = await this.prisma.course.findFirst({
          where: { code: { equals: codigo.trim(), mode: 'insensitive' } },
        });

        if (existingCourse) {
          // Update existing course
          const updatedCourse = await this.prisma.course.update({
            where: { id: existingCourse.id },
            data: {
              name: nombre.trim(),
              credits: creditos,
              level: nivel,
              contactHours: horasContacto,
              independentHours: horasIndependientes || null,
              description: descripcion?.trim() || null,
              updatedAt: new Date(),
            },
          });
          updated++;
          courseIds.push(updatedCourse.id);
          this.logger.debug(`[bulkImportCourses] Updated course: ${codigo}`);
        } else {
          // Create new course
          const newCourse = await this.prisma.course.create({
            data: {
              code: codigo.trim().toUpperCase(),
              name: nombre.trim(),
              credits: creditos,
              level: nivel,
              contactHours: horasContacto,
              independentHours: horasIndependientes || null,
              description: descripcion?.trim() || null,
              status: Status.ACTIVE,
            },
          });
          created++;
          courseIds.push(newCourse.id);
          this.logger.debug(`[bulkImportCourses] Created course: ${codigo}`);
        }
      } catch (error) {
        errors++;
        const errorMsg = error instanceof Error ? error.message : String(error);
        errorDetails.push(`Curso ${course.codigo}: ${errorMsg}`);
        this.logger.error(`[bulkImportCourses] Error: ${errorMsg}`);
      }
    }

    this.logger.log(
      `[bulkImportCourses] Completed: ${created} created, ${updated} updated, ${errors} errors`,
    );

    return {
      created,
      updated,
      errors,
      errorDetails,
      courseIds,
    };
  }
}
