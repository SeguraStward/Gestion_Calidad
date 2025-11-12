import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { Prisma, ExternalProvider } from '@una-gc/database/prisma/generated/client';

@Injectable()
export class ExternalProvidersRepository extends GenericPrismaRepository<
  ExternalProvider,
  Prisma.ExternalProviderCreateInput,
  Prisma.ExternalProviderUpdateInput,
  Prisma.ExternalProviderWhereUniqueInput
> {
  protected readonly modelName = 'externalProvider' as const;

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  /**
   * Buscar proveedores externos por asignación anual
   */
  async findByAnnualAllocation(annualAllocationId: string) {
    return this.prismaService.externalProvider.findMany({
      where: { annualAllocationId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Calcular el total de tiempo proporcionado por proveedores externos
   * para una asignación anual específica
   */
  async calculateTotalProvidedTime(annualAllocationId: string): Promise<number> {
    const providers = await this.findByAnnualAllocation(annualAllocationId);
    return providers.reduce((sum, provider) => sum + provider.providedJourneyTime, 0);
  }

  /**
   * Verificar si existe un proveedor con el mismo nombre para una asignación anual
   */
  async existsByNameAndAllocation(name: string, annualAllocationId: string, excludeId?: string) {
    const where: any = {
      name,
      annualAllocationId,
      status: 'ACTIVE',
    };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    const count = await this.prismaService.externalProvider.count({ where });
    return count > 0;
  }
}
