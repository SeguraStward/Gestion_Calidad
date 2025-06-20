import { Logger } from '@nestjs/common';
import { Prisma, School } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';
//FIXED

export class SchoolsRepository extends GenericPrismaRepository<
  School,
  Prisma.SchoolCreateInput,
  Prisma.SchoolUpdateInput,
  Prisma.SchoolWhereUniqueInput
> {
  private readonly logger = new Logger(SchoolsRepository.name);
  protected readonly modelName = 'school';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('SchoolsRepository initialized');
  }

  async findAll(page?: number, limit?: number, where?: any, orderBy?: any, include?: Record<string, any>) {
    const [data, total] = await Promise.all([
      this.prisma.school.findMany({
        where,
        orderBy,
        skip: page && limit ? (page - 1) * limit : undefined,
        take: limit,
        include: { ...(include || {}), faculty: true, careers: true },
      }),
      this.prisma.school.count({ where }),
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
    return this.prisma.school.findUnique({
      where: { id },
      include: { ...(include || {}), faculty: true, careers: true },
    });
  }
}
