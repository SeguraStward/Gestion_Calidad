import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { Prisma, InstitutionalProject } from '@una-gc/database/prisma/generated/client';

@Injectable()
export class InstitutionalProjectsRepository extends GenericPrismaRepository<
  InstitutionalProject,
  Prisma.InstitutionalProjectCreateInput,
  Prisma.InstitutionalProjectUpdateInput,
  Prisma.InstitutionalProjectWhereUniqueInput
> {
  protected readonly modelName = 'institutionalProject' as const;

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  /**
   * Buscar proyectos por asignación de campus
   */
  async findByCampusAllocation(campusAllocationId: string) {
    return this.prismaService.institutionalProject.findMany({
      where: { campusAllocationId, status: 'ACTIVE' },
      include: {
        director: { select: { id: true, fullName: true, email: true } },
        professorAssignments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Buscar proyectos por director
   */
  async findByDirector(directorId: string) {
    return this.prismaService.institutionalProject.findMany({
      where: { directorId, status: 'ACTIVE' },
      include: {
        campusAllocation: true,
        professorAssignments: true,
      },
      orderBy: { startDate: 'desc' },
    });
  }

  /**
   * Calcular el total de tiempo asignado para una campus allocation
   */
  async calculateTotalAssignedTime(campusAllocationId: string): Promise<number> {
    const projects = await this.prismaService.institutionalProject.findMany({
      where: { campusAllocationId, status: 'ACTIVE' },
      select: { assignedJourneyTime: true },
    });
    return projects.reduce((sum, project) => sum + project.assignedJourneyTime, 0);
  }

  /**
   * Verificar si existe un proyecto con el mismo código
   */
  async existsByCode(code: string, excludeId?: string): Promise<boolean> {
    const where: any = { code, status: 'ACTIVE' };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    const count = await this.prismaService.institutionalProject.count({ where });
    return count > 0;
  }

  /**
   * Obtener proyectos activos con tiempo disponible para asignación
   */
  async findWithAvailableTime() {
    const projects = await this.prismaService.institutionalProject.findMany({
      where: {
        status: 'ACTIVE',
        projectStatus: { in: ['APPROVED', 'ACTIVE'] },
      },
      include: {
        director: { select: { id: true, fullName: true } },
        professorAssignments: true,
      },
    });

    // Calcular tiempo disponible para cada proyecto
    return projects.map((project) => {
      const consumed = project.professorAssignments.reduce(
        (sum, assignment) => sum + (assignment.calculatedJourneyTime || 0),
        0,
      );
      const available = project.assignedJourneyTime - consumed;

      return {
        ...project,
        consumedTime: consumed,
        availableTime: available,
      };
    });
  }
}
