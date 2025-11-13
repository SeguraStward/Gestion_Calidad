import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { Prisma, AnnualJourneyTimeAllocation } from '@una-gc/database/prisma/generated/client';

@Injectable()
export class AnnualJourneyTimeAllocationsRepository extends GenericPrismaRepository<
  AnnualJourneyTimeAllocation,
  Prisma.AnnualJourneyTimeAllocationCreateInput,
  Prisma.AnnualJourneyTimeAllocationUpdateInput,
  Prisma.AnnualJourneyTimeAllocationWhereUniqueInput
> {
  // ⬇️ define el nombre del delegate que usará el genérico
  protected readonly modelName = 'annualJourneyTimeAllocation' as const;

  constructor(prisma: PrismaService) {
    // ⬇️ tu GenericPrismaRepository SOLO recibe el prisma
    super(prisma);
  }

  /**
   * Buscar asignación anual por año
   */
  async findByYear(year: number) {
    return this.prismaService.annualJourneyTimeAllocation.findFirst({
      where: { year },
      include: {
        campusAllocations: {
          include: {
            campus: { select: { id: true, name: true } },
            curricularMesh: { select: { id: true, name: true } },
            academicCycle: { select: { id: true, name: true } },
            professorAssignments: true,
            institutionalProjects: true,
          },
        },
        externalProviders: true,
      },
    });
  }
}
