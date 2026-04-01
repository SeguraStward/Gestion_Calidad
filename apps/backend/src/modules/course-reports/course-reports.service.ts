import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { CourseReportsRepository } from './course-reports.repository';
import { CreateCourseReportDto } from './dtos/create-course-report.dto';
import { UpdateCourseReportDto } from './dtos/update-course-report.dto';

const REZAGADOS_ALERT_THRESHOLD = 20;

@Injectable()
export class CourseReportsService {
  private readonly logger = new Logger(CourseReportsService.name);

  constructor(
    private readonly repo: CourseReportsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateCourseReportDto) {
    this.logger.log(`Creando informe de curso ${dto.courseId} para ciclo ${dto.academicCycleId}`);
    return this.repo.save({
      courseId: dto.courseId,
      academicCycleId: dto.academicCycleId,
      campusId: dto.campusId,
      professorId: dto.professorId,
      matriculados: dto.matriculados,
      aprobados: dto.aprobados,
      reprobados: dto.reprobados,
      isFinal: dto.isFinal ?? false,
      status: dto.status ?? 'PENDING',
    } as any);
  }

  async findAll() {
    return this.repo.findAll();
  }

  async findById(id: string) {
    return this.repo.findById(id);
  }

  async findByCampus(campusId: string) {
    return this.repo.findByCampus(campusId);
  }

  async update(id: string, dto: UpdateCourseReportDto) {
    this.logger.log(`Actualizando informe ${id}`);
    return this.repo.update(id, dto as any);
  }

  async delete(id: string) {
    this.logger.log(`Eliminando informe ${id}`);
    return this.repo.deleteById(id);
  }

  /**
   * Proyección de rezagados por curso para un campus y ciclo dado.
   * Solo considera reportes finales de los últimos 2 años.
   * Si un curso tiene 20+ rezagados proyectados → recomendaAbrirGrupo = true
   */
  async getProjections(campusId: string, cycleId: string) {
    const cycle = await this.prisma.academicCycle.findUnique({ where: { id: cycleId } });
    if (!cycle) throw new NotFoundException(`Ciclo ${cycleId} no encontrado`);

    const reports = await this.repo.findForProjection(campusId, cycle.year);

    // Agrupar reprobados por curso
    const byCourseid = new Map<string, { courseId: string; courseName: string; courseCode: string; rezagados: number }>();

    for (const report of reports) {
      const key = report.courseId;
      const existing = byCourseid.get(key) ?? {
        courseId: report.courseId,
        courseName: report.courseId,
        courseCode: '',
        rezagados: 0,
      };
      existing.rezagados += report.reprobados;
      byCourseid.set(key, existing);
    }

    return Array.from(byCourseid.values()).map((item) => ({
      ...item,
      rezagadosProyectados: item.rezagados,
      recomendaAbrirGrupo: item.rezagados >= REZAGADOS_ALERT_THRESHOLD,
    }));
  }

  /**
   * Solo cursos con 20+ rezagados proyectados (alertas para Erick).
   */
  async getAlerts(campusId: string) {
    // Usar el ciclo activo del campus para obtener el año de referencia
    const activeCycle = await this.prisma.academicCycle.findFirst({
      where: { status: 'ACTIVE' },
      orderBy: { year: 'desc' },
    });

    const referenceYear = activeCycle?.year ?? new Date().getFullYear();
    const reports = await this.repo.findForProjection(campusId, referenceYear);

    const byCourseid = new Map<string, { courseId: string; courseName: string; courseCode: string; rezagados: number }>();

    for (const report of reports) {
      const key = report.courseId;
      const existing = byCourseid.get(key) ?? {
        courseId: report.courseId,
        courseName: report.courseId,
        courseCode: '',
        rezagados: 0,
      };
      existing.rezagados += report.reprobados;
      byCourseid.set(key, existing);
    }

    return Array.from(byCourseid.values())
      .filter((item) => item.rezagados >= REZAGADOS_ALERT_THRESHOLD)
      .map((item) => ({
        ...item,
        rezagadosProyectados: item.rezagados,
        recomendaAbrirGrupo: true,
      }));
  }
}
