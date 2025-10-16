import { Logger } from '@nestjs/common';
import { Prisma, Standard } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class StandardsRepository extends GenericPrismaRepository<
  Standard,
  Prisma.StandardCreateInput,
  Prisma.StandardUpdateInput,
  Prisma.StandardWhereUniqueInput
> {
  private readonly logger = new Logger(StandardsRepository.name);
  protected readonly modelName = 'standard';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('StandardsRepository initialized');
  }

  async findAll(page?: number, limit?: number, where?: any, orderBy?: any, include?: Record<string, any>) {
    // Clean empty strings from where clause to avoid Prisma ObjectID errors
    const cleanWhere = this.cleanWhereClause(where);

    const [data, total] = await Promise.all([
      this.prisma.standard.findMany({
        where: cleanWhere,
        orderBy: orderBy || { order: 'asc' },
        skip: page && limit ? (page - 1) * limit : undefined,
        take: limit,
        include: { ...(include || {}), criterion: true, evidences: true, standardEvidences: true },
      }),
      this.prisma.standard.count({ where: cleanWhere }),
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

  /**
   * Remove empty strings and null values from where clause
   * to avoid Prisma validation errors with ObjectIDs
   */
  private cleanWhereClause(where?: any): any {
    if (!where) return where;

    const cleaned: any = {};

    for (const key in where) {
      const value = where[key];

      // Skip empty strings, null, and undefined
      if (value === '' || value === null || value === undefined) {
        continue;
      }

      // Recursively clean nested objects
      if (typeof value === 'object' && !Array.isArray(value)) {
        const cleanedNested = this.cleanWhereClause(value);
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key] = cleanedNested;
        }
      } else {
        cleaned[key] = value;
      }
    }

    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }

  async findById(id: string, include?: Record<string, any>) {
    return this.prisma.standard.findUnique({
      where: { id },
      include: { ...(include || {}), criterion: true, evidences: true, standardEvidences: true },
    });
  }
}
