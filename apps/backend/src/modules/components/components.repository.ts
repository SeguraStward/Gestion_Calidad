import { Logger } from '@nestjs/common';
import { Prisma, Component } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class ComponentsRepository extends GenericPrismaRepository<
  Component,
  Prisma.ComponentCreateInput,
  Prisma.ComponentUpdateInput,
  Prisma.ComponentWhereUniqueInput
> {
  private readonly logger = new Logger(ComponentsRepository.name);
  protected readonly modelName = 'component';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('ComponentsRepository initialized');
  }

  async findAll(page?: number, limit?: number, where?: any, orderBy?: any, include?: Record<string, any>) {
    const [data, total] = await Promise.all([
      this.prisma.component.findMany({
        where,
        orderBy: orderBy || { order: 'asc' },
        skip: page && limit ? (page - 1) * limit : undefined,
        take: limit,
        include: { ...(include || {}), dimension: true, criteria: true },
      }),
      this.prisma.component.count({ where }),
    ]);
    return {
      data,
      meta: {
        total,
        page: page ?? 1,
        limit: limit ?? total,
        pageCount: limit ? Math.ceil(total / limit) : 1,
      },
    };
  }

  async findById(id: string, include?: Record<string, any>) {
    return this.prisma.component.findUnique({
      where: { id },
      include: { ...(include || {}), dimension: true, criteria: true },
    });
  }

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const component = await this.prisma.component.findFirst({
      where: {
        name,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
    return !!component;
  }
}
