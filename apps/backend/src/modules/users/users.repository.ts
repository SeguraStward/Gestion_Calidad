import { Logger } from '@nestjs/common';
import { Prisma, User } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';
import { PaginatedResponse } from '@core/http/interfaces/paginated-response.interface';

export class UsersRepository extends GenericPrismaRepository<
  User,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput,
  Prisma.UserWhereUniqueInput
> {
  private readonly logger = new Logger(UsersRepository.name);
  protected readonly modelName = 'user';
  protected readonly defaultIncludes = { roles: true };

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('UsersRepository initialized');
  }

  async findAll(
    page = 1,
    limit = 10,
    where: any = {},
    orderBy: any = {},
    include?: Record<string, any>,
  ): Promise<PaginatedResponse<User>> {
    const skip = (page - 1) * limit;

    // Build where clause with filters
    const prismaWhere: Prisma.UserWhereInput = {};

    // Handle search filter
    if (where.search) {
      prismaWhere.OR = [
        { fullName: { contains: where.search, mode: 'insensitive' } },
        { fullLastName: { contains: where.search, mode: 'insensitive' } },
        { email: { contains: where.search, mode: 'insensitive' } },
        // Combined full name search
        {
          AND: [
            { fullName: { contains: where.search.split(' ')[0] || '', mode: 'insensitive' } },
            { fullLastName: { contains: where.search.split(' ')[1] || where.search.split(' ')[0] || '', mode: 'insensitive' } }
          ]
        }
      ];
    }

    // Filtro por estado
    if (where.status && where.status !== 'ALL') {
      prismaWhere.status = where.status as any;
    }

    // Filtro por rol
    if (where.role && where.role !== 'ALL') {
      prismaWhere.roles = {
        some: {
          id: where.role,
        },
      };
    }    // Build orderBy clause
    let prismaOrderBy: Prisma.UserOrderByWithRelationInput = { fullName: 'asc' };

    if (where.sortBy && where.sortOrder) {
      const sortOrder = (where.sortOrder === 'desc' ? 'desc' : 'asc') as Prisma.SortOrder;

      switch (where.sortBy) {
        case 'fullName':
          prismaOrderBy = { fullName: sortOrder };
          break;
        case 'email':
          prismaOrderBy = { email: sortOrder };
          break;
        case 'createdAt':
          prismaOrderBy = { createdAt: sortOrder };
          break;
        case 'updatedAt':
          prismaOrderBy = { updatedAt: sortOrder };
          break;
        default:
          prismaOrderBy = { fullName: 'asc' };
      }
    }

    const finalInclude = { ...this.defaultIncludes, ...include };
    const effectiveInclude = Object.keys(finalInclude).length > 0 ? finalInclude : undefined;

    this.logger.debug(
      `[${this.modelName}] Search query: ${JSON.stringify({
        where: prismaWhere,
        orderBy: prismaOrderBy,
        include: effectiveInclude
      })}`,
    );

    const [data, totalCount] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: Number(limit),
        where: prismaWhere,
        orderBy: prismaOrderBy,
        include: effectiveInclude,
      }),
      this.prisma.user.count({ where: prismaWhere }),
    ]);

    return {
      data,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
      },
    };
  }
}
