import { Logger } from '@nestjs/common';
import { Prisma, UserRole } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';
import { PaginatedResponse } from '@core/http/interfaces/paginated-response.interface';

export class UserRolesRepository extends GenericPrismaRepository<
  UserRole,
  Prisma.UserRoleCreateInput,
  Prisma.UserRoleUpdateInput,
  Prisma.UserRoleWhereUniqueInput
> {
  private readonly logger = new Logger(UserRolesRepository.name);
  protected readonly modelName = 'userRole';
  protected readonly defaultIncludes = { permissions: true, users: true };

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('UserRolesRepository initialized');
  }

  async findAll(
    page = 1,
    limit = 10,
    where: any = {},
    orderBy: any = {},
    include?: Record<string, any>,
  ): Promise<PaginatedResponse<UserRole>> {
    const skip = (page - 1) * limit;

    // Build where clause with filters
    const prismaWhere: Prisma.UserRoleWhereInput = {};

    // Handle search filter
    if (where.search) {
      prismaWhere.OR = [
        { name: { contains: where.search, mode: 'insensitive' } },
        { description: { contains: where.search, mode: 'insensitive' } }
      ];
    }

    // Handle status filter
    if (where.status && where.status !== 'ALL') {
      prismaWhere.status = where.status;
    }

    // Build orderBy clause
    let prismaOrderBy: Prisma.UserRoleOrderByWithRelationInput = { name: 'asc' };

    if (where.sortBy && where.sortOrder) {
      const sortOrder = (where.sortOrder === 'desc' ? 'desc' : 'asc') as Prisma.SortOrder;

      switch (where.sortBy) {
        case 'name':
          prismaOrderBy = { name: sortOrder };
          break;
        case 'createdAt':
          prismaOrderBy = { createdAt: sortOrder };
          break;
        case 'updatedAt':
          prismaOrderBy = { updatedAt: sortOrder };
          break;
        default:
          prismaOrderBy = { name: 'asc' };
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
      this.prisma.userRole.findMany({
        skip,
        take: Number(limit),
        where: prismaWhere,
        orderBy: prismaOrderBy,
        include: effectiveInclude,
      }),
      this.prisma.userRole.count({ where: prismaWhere }),
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
