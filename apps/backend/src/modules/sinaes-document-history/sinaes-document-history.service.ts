import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDocumentHistoryDto } from './dtos/create-document-history.dto';
import { DocumentHistoryDto, DocumentHistoryListDto } from './dtos/document-history.dto';
import { DocumentHistoryFiltersDto } from './dtos/document-history-filters.dto';
import { plainToClass } from 'class-transformer';
import { ChangeType } from '@una-gc/database/prisma/generated/client';

@Injectable()
export class SinaesDocumentHistoryService {
  private readonly logger = new Logger(SinaesDocumentHistoryService.name);

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Registrar un cambio en el historial
   */
  async logChange(dto: CreateDocumentHistoryDto): Promise<DocumentHistoryDto> {
    this.logger.log(`📝 Logging change: ${dto.changeType} for document ${dto.documentId}`);

    try {
      const history = await this.prisma.sinaesDocumentHistory.create({
        data: {
          documentId: dto.documentId,
          userId: dto.userId,
          changeType: dto.changeType,
          fieldChanged: dto.fieldChanged,
          oldValue: dto.oldValue,
          newValue: dto.newValue,
          reason: dto.reason,
          ipAddress: dto.ipAddress,
          userAgent: dto.userAgent,
          description: dto.description,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              fullLastName: true,
              email: true,
            },
          },
        },
      });

      this.logger.log(`✅ Change logged successfully: ${history.id}`);
      return plainToClass(DocumentHistoryDto, history, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      this.logger.error(`❌ Error logging change:`, error);
      throw error;
    }
  }

  /**
   * Obtener historial de un documento específico
   */
  async getDocumentHistory(
    documentId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<DocumentHistoryListDto> {
    this.logger.log(`📋 Getting history for document ${documentId}`);

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.sinaesDocumentHistory.findMany({
        where: { documentId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              fullLastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.sinaesDocumentHistory.count({
        where: { documentId },
      }),
    ]);

    return {
      data: plainToClass(DocumentHistoryDto, data, {
        excludeExtraneousValues: true,
      }),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtener actividad de un usuario
   */
  async getUserActivity(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<DocumentHistoryListDto> {
    this.logger.log(`👤 Getting activity for user ${userId}`);

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.sinaesDocumentHistory.findMany({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              fullLastName: true,
              email: true,
            },
          },
          document: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.sinaesDocumentHistory.count({
        where: { userId },
      }),
    ]);

    return {
      data: plainToClass(DocumentHistoryDto, data, {
        excludeExtraneousValues: true,
      }),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtener cambios recientes del sistema
   */
  async getRecentChanges(
    filters?: DocumentHistoryFiltersDto
  ): Promise<DocumentHistoryListDto> {
    this.logger.log('🕐 Getting recent changes');

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    // Construir filtros de búsqueda
    const where: any = {};

    if (filters?.changeType) {
      where.changeType = filters.changeType;
    }

    if (filters?.fieldChanged) {
      where.fieldChanged = filters.fieldChanged;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo);
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.sinaesDocumentHistory.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              fullLastName: true,
              email: true,
            },
          },
          document: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.sinaesDocumentHistory.count({ where }),
    ]);

    return {
      data: plainToClass(DocumentHistoryDto, data, {
        excludeExtraneousValues: true,
      }),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtener estadísticas de actividad
   */
  async getActivityStatistics(documentId?: string): Promise<{
    totalChanges: number;
    changesByType: Record<ChangeType, number>;
    topUsers: Array<{ userId: string; userName: string; changeCount: number }>;
    recentActivity: Array<{ date: string; count: number }>;
  }> {
    this.logger.log('📊 Getting activity statistics');

    const where = documentId ? { documentId } : {};

    // Total de cambios
    const totalChanges = await this.prisma.sinaesDocumentHistory.count({
      where,
    });

    // Cambios por tipo
    const changesByTypeRaw = await this.prisma.sinaesDocumentHistory.groupBy({
      by: ['changeType'],
      where,
      _count: true,
    });

    const changesByType = changesByTypeRaw.reduce(
      (acc, item) => {
        acc[item.changeType] = item._count;
        return acc;
      },
      {} as Record<ChangeType, number>
    );

    // Top usuarios más activos
    const topUsersRaw = await this.prisma.sinaesDocumentHistory.groupBy({
      by: ['userId'],
      where,
      _count: true,
      orderBy: {
        _count: {
          userId: 'desc',
        },
      },
      take: 5,
    });

    const topUsers = await Promise.all(
      topUsersRaw.map(async (item) => {
        const user = await this.prisma.user.findUnique({
          where: { id: item.userId },
          select: { fullName: true, fullLastName: true },
        });
        return {
          userId: item.userId,
          userName: user
            ? `${user.fullName} ${user.fullLastName}`
            : 'Usuario desconocido',
          changeCount: item._count,
        };
      })
    );

    // Actividad de los últimos 7 días
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Obtener actividad agrupada por día usando agregación de Prisma
    const recentHistory = await this.prisma.sinaesDocumentHistory.findMany({
      where: {
        ...where,
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        createdAt: true,
      },
    });

    // Agrupar manualmente por día
    const activityByDay = recentHistory.reduce((acc, item) => {
      const date = item.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentActivity = Object.entries(activityByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.date.localeCompare(a.date));

    return {
      totalChanges,
      changesByType,
      topUsers,
      recentActivity,
    };
  }

  /**
   * Helper: Detectar cambios entre dos objetos
   */
  detectChanges(
    oldData: Record<string, any>,
    newData: Record<string, any>
  ): Array<{ field: string; oldValue: string; newValue: string }> {
    const changes: Array<{ field: string; oldValue: string; newValue: string }> =
      [];

    // Solo comparar campos que existen en newData (campos que se están actualizando)
    // Esto evita detectar como cambios los campos que no se están modificando
    const keysToCompare = Object.keys(newData);

    this.logger.debug(`🔍 Detecting changes. Keys to compare: ${keysToCompare.join(', ')}`);

    for (const key of keysToCompare) {
      // Ignorar campos de auditoría y metadata
      if (
        ['id', 'createdAt', 'updatedAt', 'version', '__v'].includes(key)
      ) {
        continue;
      }

      const oldValue = oldData[key];
      const newValue = newData[key];

      // Solo detectar cambio si el valor realmente cambió
      // Nota: Si newValue es undefined, no se considera un cambio (campo no se está actualizando)
      if (newValue !== undefined && JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        this.logger.debug(`📝 Change detected in field "${key}": ${JSON.stringify(oldValue)} → ${JSON.stringify(newValue)}`);
        changes.push({
          field: key,
          oldValue: this.serializeValue(oldValue),
          newValue: this.serializeValue(newValue),
        });
      }
    }

    this.logger.debug(`✅ Total changes detected: ${changes.length}`);
    return changes;
  }

  /**
   * Helper: Serializar valor para almacenamiento
   */
  private serializeValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }
}
