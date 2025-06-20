import { Logger } from '@nestjs/common';
import { Prisma, Classroom } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class ClassroomsRepository extends GenericPrismaRepository<
  Classroom,
  Prisma.ClassroomCreateInput,
  Prisma.ClassroomUpdateInput,
  Prisma.ClassroomWhereUniqueInput
> {
  private readonly logger = new Logger(ClassroomsRepository.name);
  protected readonly modelName = 'classroom';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('ClassroomsRepository initialized');
  }

  async findAll(page?: number, limit?: number, where?: any, orderBy?: any, include?: Record<string, any>) {
    const [data, total] = await Promise.all([
      this.prisma.classroom.findMany({
        where,
        orderBy,
        skip: page && limit ? (page - 1) * limit : undefined,
        take: limit,
        include: { ...(include || {}), campus: true, academicLoads: true },
      }),
      this.prisma.classroom.count({ where }),
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
    return this.prisma.classroom.findUnique({
      where: { id },
      include: { ...(include || {}), campus: true, academicLoads: true },
    });
  }
}
