import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';

export interface CareerCycleSummaryRow {
  careerId: string;
  careerName: string;
  campusId: string;
  campusName: string;
  cycleId: string;
  cycleName: string;
  cycleNumber: number;
  isRepitencia: boolean;
  totalJourneyTime: number;
  assignmentCount: number;
}

export interface CareerAnnualSummary {
  careerId: string;
  careerName: string;
  campusId: string;
  campusName: string;
  byCycle: Record<string, number>;   // cycleName → jornadas
  repitencia: number;
  totalYear: number;
}

@Injectable()
export class TimesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Devuelve jornadas consumidas por carrera × ciclo para un año dado.
   * Fuente: ProfessorAssignment.calculatedJourneyTime agrupado por
   * curricularMesh.career + academicCycle.
   *
   * Erick lo ve así: carrera | Ciclo I | Ciclo II | Repitencia | Total año
   */
  async getCareerSummary(year: number): Promise<CareerAnnualSummary[]> {
    const assignments = await this.prisma.professorAssignment.findMany({
      where: {
        status: 'ACTIVE',
        academicCycle: { year },
      },
      select: {
        calculatedJourneyTime: true,
        assignmentType: true,
        campus: { select: { id: true, name: true } },
        academicCycle: { select: { id: true, name: true, year: true } },
        curricularMeshCourse: {
          select: {
            isRepeatOffering: true,
            curricularMesh: {
              select: {
                career: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    // Agrupar por careerId + campusId + cycleName
    const grouped = new Map<
      string,
      {
        careerId: string;
        careerName: string;
        campusId: string;
        campusName: string;
        byCycle: Record<string, number>;
        repitencia: number;
      }
    >();

    for (const a of assignments) {
      const career = a.curricularMeshCourse?.curricularMesh?.career;
      if (!career) continue;

      const key = `${career.id}::${a.campus.id}`;
      const existing = grouped.get(key) ?? {
        careerId: career.id,
        careerName: career.name,
        campusId: a.campus.id,
        campusName: a.campus.name,
        byCycle: {},
        repitencia: 0,
      };

      const isRepeat = a.curricularMeshCourse?.isRepeatOffering ?? false;
      const journeyTime = a.calculatedJourneyTime ?? 0;

      if (isRepeat) {
        existing.repitencia += journeyTime;
      } else {
        const cycleName = a.academicCycle.name;
        existing.byCycle[cycleName] = (existing.byCycle[cycleName] ?? 0) + journeyTime;
      }

      grouped.set(key, existing);
    }

    return Array.from(grouped.values()).map((row) => ({
      ...row,
      totalYear:
        Object.values(row.byCycle).reduce((s, v) => s + v, 0) + row.repitencia,
    }));
  }

  /**
   * Balance anual: tiempos disponibles vs consumidos.
   * Devuelve los 3 números clave que Erick ve en su Excel:
   *   - jornadasDocencia: lo que necesitan las carreras (ProfessorAssignment)
   *   - jornadasDisponibles: base + externos
   *   - jornadasProyectos: consumo de proyectos institucionales
   *   - saldo: disponibles - docencia - proyectos
   */
  async getAnnualBalance(year: number) {
    const [annualAlloc, assignments, projects] = await Promise.all([
      this.prisma.annualJourneyTimeAllocation.findFirst({
        where: { year },
        include: { externalProviders: { where: { status: 'ACTIVE' } } },
      }),
      this.prisma.professorAssignment.findMany({
        where: { status: 'ACTIVE', academicCycle: { year } },
        select: { calculatedJourneyTime: true },
      }),
      this.prisma.institutionalProject.findMany({
        where: {
          projectStatus: 'ACTIVE',
          startDate: { lte: new Date(`${year}-12-31`) },
          endDate: { gte: new Date(`${year}-01-01`) },
        },
        select: { requiredJourneyTime: true, startDate: true, endDate: true },
      }),
    ]);

    const base = annualAlloc?.totalJourneyTime ?? 0;
    const externos = annualAlloc?.externalProviders.reduce(
      (s, p) => s + p.providedJourneyTime,
      0,
    ) ?? 0;
    const jornadasDisponibles = base + externos;

    const jornadasDocencia = assignments.reduce(
      (s, a) => s + (a.calculatedJourneyTime ?? 0),
      0,
    );

    // Ajustar peso de proyectos por vigencia parcial en el año
    const yearStart = new Date(`${year}-01-01`).getTime();
    const yearEnd = new Date(`${year}-12-31`).getTime();
    const yearMs = yearEnd - yearStart;

    const jornadasProyectos = projects.reduce((s, p) => {
      const start = Math.max(p.startDate.getTime(), yearStart);
      const end = Math.min(p.endDate.getTime(), yearEnd);
      const fraction = Math.max(0, (end - start) / yearMs);
      return s + p.requiredJourneyTime * fraction;
    }, 0);

    return {
      year,
      jornadasDisponibles: +jornadasDisponibles.toFixed(4),
      jornadasDocencia: +jornadasDocencia.toFixed(4),
      jornadasProyectos: +jornadasProyectos.toFixed(4),
      saldo: +(jornadasDisponibles - jornadasDocencia - jornadasProyectos).toFixed(4),
    };
  }
}
