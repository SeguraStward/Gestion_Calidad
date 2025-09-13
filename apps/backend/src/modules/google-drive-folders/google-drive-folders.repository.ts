import { Logger } from '@nestjs/common';
import { Prisma, GoogleDriveFolder } from '@una-gc/database/prisma/generated/client';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { PrismaService } from '@src/prisma/prisma.service';

export class GoogleDriveFoldersRepository extends GenericPrismaRepository<
  GoogleDriveFolder,
  Prisma.GoogleDriveFolderCreateInput,
  Prisma.GoogleDriveFolderUpdateInput,
  Prisma.GoogleDriveFolderWhereUniqueInput
> {
  private readonly logger = new Logger(GoogleDriveFoldersRepository.name);
  protected readonly modelName = 'googleDriveFolder';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
    this.logger.debug('GoogleDriveFoldersRepository initialized');
  }

  async findAll(page?: number, limit?: number, where?: any, orderBy?: any, include?: Record<string, any>) {
    const [data, total] = await Promise.all([
      this.prisma.googleDriveFolder.findMany({
        where,
        orderBy: orderBy || { level: 'asc', path: 'asc' },
        skip: page && limit ? (page - 1) * limit : undefined,
        take: limit,
        include: {
          ...(include || {}),
          parentFolder: true,
          childFolders: true
        },
      }),
      this.prisma.googleDriveFolder.count({ where }),
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
    return this.prisma.googleDriveFolder.findUnique({
      where: { id },
      include: {
        ...(include || {}),
        parentFolder: true,
        childFolders: true
      },
    });
  }

  // Método específico para encontrar carpetas por nivel
  async findByLevel(level: number, include?: Record<string, any>) {
    return this.prisma.googleDriveFolder.findMany({
      where: { level },
      orderBy: { path: 'asc' },
      include: {
        ...(include || {}),
        parentFolder: true,
        childFolders: true
      },
    });
  }

  // Método específico para encontrar carpetas por tipo de entidad
  async findByEntityType(entityType: string, include?: Record<string, any>) {
    return this.prisma.googleDriveFolder.findMany({
      where: { entityType },
      orderBy: { level: 'asc', path: 'asc' },
      include: {
        ...(include || {}),
        parentFolder: true,
        childFolders: true
      },
    });
  }
}
