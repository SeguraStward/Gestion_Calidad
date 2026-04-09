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
   * Acumula reprobados por curso para un campus en los últimos 2 años,
   * enriqueciendo con el nombre y código real del curso.
   * Retorna un Map de courseId → { courseId, courseName, courseCode, rezagados }
   */
  private async buildRezagadosMap(
    campusId: string,
    referenceYear: number,
  ): Promise<Map<string, { courseId: string; courseName: string; courseCode: string; rezagados: number }>> {
    const reports = await this.repo.findForProjection(campusId, referenceYear);

    // Recopilar IDs únicos de cursos
    const courseIds = [...new Set(reports.map((r) => r.courseId))];

    // Obtener nombres reales de los cursos en una sola query
    const courses = await this.prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: { id: true, name: true, code: true },
    });
    const courseMap = new Map(courses.map((c) => [c.id, c]));

    // Agrupar reprobados por curso
    const byCourseid = new Map<string, { courseId: string; courseName: string; courseCode: string; rezagados: number }>();

    for (const report of reports) {
      const course = courseMap.get(report.courseId);
      const existing = byCourseid.get(report.courseId) ?? {
        courseId: report.courseId,
        courseName: course?.name ?? 'Curso desconocido',
        courseCode: course?.code ?? '',
        rezagados: 0,
      };
      existing.rezagados += report.reprobados;
      byCourseid.set(report.courseId, existing);
    }

    return byCourseid;
  }

  /**
   * Proyección de rezagados por curso para un campus y ciclo de referencia.
   * Solo considera reportes finales de los últimos 2 años.
   * recomendaAbrirGrupo = true cuando rezagados >= 20.
   */
  async getProjections(campusId: string, cycleId: string) {
    const cycle = await this.prisma.academicCycle.findUnique({ where: { id: cycleId } });
    if (!cycle) throw new NotFoundException(`Ciclo ${cycleId} no encontrado`);

    const byCourseid = await this.buildRezagadosMap(campusId, cycle.year);

    return Array.from(byCourseid.values()).map((item) => ({
      courseId: item.courseId,
      courseName: item.courseName,
      courseCode: item.courseCode,
      rezagadosProyectados: item.rezagados,
      recomendaAbrirGrupo: item.rezagados >= REZAGADOS_ALERT_THRESHOLD,
    }));
  }

  /**
   * Cursos con 20+ rezagados proyectados — alertas para Erick.
   * Usa el año del ciclo activo como referencia.
   */
  async getAlerts(campusId: string) {
    const activeCycle = await this.prisma.academicCycle.findFirst({
      where: { status: 'ACTIVE' },
      orderBy: { year: 'desc' },
    });
    const referenceYear = activeCycle?.year ?? new Date().getFullYear();

    const byCourseid = await this.buildRezagadosMap(campusId, referenceYear);

    return Array.from(byCourseid.values())
      .filter((item) => item.rezagados >= REZAGADOS_ALERT_THRESHOLD)
      .map((item) => ({
        courseId: item.courseId,
        courseName: item.courseName,
        courseCode: item.courseCode,
        rezagadosProyectados: item.rezagados,
        recomendaAbrirGrupo: true,
      }));
  }
}
