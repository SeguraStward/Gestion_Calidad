import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { Prisma, Repitencia } from '@una-gc/database/prisma/generated/client';

@Injectable()
export class RepitenciasRepository extends GenericPrismaRepository<
  Repitencia,
  Prisma.RepitenciaCreateInput,
  Prisma.RepitenciaUpdateInput,
  Prisma.RepitenciaWhereUniqueInput
> {
  protected readonly modelName = 'repitencia' as const;

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  /**
   * Buscar repitencias por campus
   */
  async findByCampus(campusId: string) {
    return this.prismaService.repitencia.findMany({
      where: { campusId },
      include: {
        campus: { select: { name: true, code: true } },
        course: { select: { name: true, code: true } },
        academicCycle: { select: { name: true, year: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Buscar repitencias por curso
   */
  async findByCourse(courseId: string) {
    return this.prismaService.repitencia.findMany({
      where: { courseId },
      include: {
        campus: { select: { name: true, code: true } },
        academicCycle: { select: { name: true, year: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Buscar repitencias por ciclo académico
   */
  async findByAcademicCycle(academicCycleId: string) {
    return this.prismaService.repitencia.findMany({
      where: { academicCycleId },
      include: {
        campus: { select: { name: true, code: true } },
        course: { select: { name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Buscar repitencias por asignación de campus
   */
  async findByCampusAllocation(campusAllocationId: string) {
    return this.prismaService.repitencia.findMany({
      where: { campusAllocationId },
      include: {
        campus: { select: { name: true, code: true } },
        course: { select: { name: true, code: true } },
        academicCycle: { select: { name: true, year: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Calcular total de horas adicionales por asignación de campus
   */
  async calculateTotalAdditionalHours(campusAllocationId: string): Promise<number> {
    const repitencias = await this.findByCampusAllocation(campusAllocationId);
    return repitencias
      .filter((r) => r.status === 'APPROVED' || r.status === 'ASSIGNED')
      .reduce((sum, r) => sum + r.additionalHours, 0);
  }

  /**
   * Obtener estadísticas de repitencias
   */
  async getStatistics() {
    const total = await this.prismaService.repitencia.count();
    const pending = await this.prismaService.repitencia.count({ where: { status: 'PENDING' } });
    const approved = await this.prismaService.repitencia.count({ where: { status: 'APPROVED' } });
    const assigned = await this.prismaService.repitencia.count({ where: { status: 'ASSIGNED' } });

    const totalHours = await this.prismaService.repitencia.aggregate({
      _sum: { additionalHours: true },
    });

    return {
      total,
      pending,
      approved,
      assigned,
      totalAdditionalHours: totalHours._sum.additionalHours || 0,
    };
  }
}
