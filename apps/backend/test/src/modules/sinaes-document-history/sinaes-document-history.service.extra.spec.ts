/**
 * Pruebas adicionales — SinaesDocumentHistoryService
 * Cubre las ramas sin cobertura:
 *  - getUserActivity        → paginación correcta, usuario sin actividad
 *  - getRecentChanges       → sin filtros, con changeType, con rango de fechas
 *  - getActivityStatistics  → con y sin documentId, topUsers con usuario desconocido
 *  - detectChanges          → campos ignorados, sin cambios, cambios múltiples
 */

import { Logger } from '@nestjs/common';
import { SinaesDocumentHistoryService } from '@modules/sinaes-document-history/sinaes-document-history.service';
import { PrismaService } from '@src/prisma/prisma.service';

const mockPrisma = () => ({
  sinaesDocumentHistory: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
});

const historialBase = {
  id: 'hist-1',
  documentId: 'doc-1',
  userId: 'user-1',
  changeType: 'UPDATED',
  createdAt: new Date('2024-06-01T10:00:00Z'),
  user: { id: 'user-1', fullName: 'Ana', fullLastName: 'García', email: 'ana@una.cr' },
};

describe('SinaesDocumentHistoryService — cobertura adicional', () => {
  let service: SinaesDocumentHistoryService;
  let prisma: ReturnType<typeof mockPrisma>;

  beforeEach(() => {
    prisma = mockPrisma();
    service = new SinaesDocumentHistoryService(prisma as unknown as PrismaService);
    jest.spyOn(service['logger'] as Logger, 'log').mockImplementation(() => {});
    jest.spyOn(service['logger'] as Logger, 'error').mockImplementation(() => {});
    jest.spyOn(service['logger'] as Logger, 'debug').mockImplementation(() => {});
  });

  // ── getUserActivity ───────────────────────────────────────────────────────

  describe('getUserActivity', () => {
    it('debe retornar actividad paginada de un usuario', async () => {
      prisma.sinaesDocumentHistory.findMany.mockResolvedValue([historialBase]);
      prisma.sinaesDocumentHistory.count.mockResolvedValue(1);

      const resultado = await service.getUserActivity('user-1', 1, 10);

      expect(prisma.sinaesDocumentHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1' }, skip: 0, take: 10 }),
      );
      expect(resultado.meta.total).toBe(1);
      expect(resultado.meta.totalPages).toBe(1);
    });

    it('debe calcular skip correcto para página 2', async () => {
      prisma.sinaesDocumentHistory.findMany.mockResolvedValue([]);
      prisma.sinaesDocumentHistory.count.mockResolvedValue(15);

      await service.getUserActivity('user-1', 2, 5);

      expect(prisma.sinaesDocumentHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 }),
      );
    });

    it('debe retornar data vacía si el usuario no tiene actividad', async () => {
      prisma.sinaesDocumentHistory.findMany.mockResolvedValue([]);
      prisma.sinaesDocumentHistory.count.mockResolvedValue(0);

      const resultado = await service.getUserActivity('user-sin-actividad');

      expect(resultado.data).toEqual([]);
      expect(resultado.meta.total).toBe(0);
    });
  });

  // ── getRecentChanges ──────────────────────────────────────────────────────

  describe('getRecentChanges', () => {
    it('debe retornar cambios recientes sin filtros', async () => {
      prisma.sinaesDocumentHistory.findMany.mockResolvedValue([historialBase]);
      prisma.sinaesDocumentHistory.count.mockResolvedValue(1);

      const resultado = await service.getRecentChanges();

      expect(prisma.sinaesDocumentHistory.findMany).toHaveBeenCalled();
      expect(resultado.data).toBeDefined();
      expect(resultado.meta.total).toBe(1);
    });

    it('debe filtrar por changeType si se proporciona', async () => {
      prisma.sinaesDocumentHistory.findMany.mockResolvedValue([]);
      prisma.sinaesDocumentHistory.count.mockResolvedValue(0);

      await service.getRecentChanges({ changeType: 'CREATED' as any, page: 1, limit: 10 });

      const where = prisma.sinaesDocumentHistory.findMany.mock.calls[0][0].where;
      expect(where.changeType).toBe('CREATED');
    });

    it('debe filtrar por rango de fechas', async () => {
      prisma.sinaesDocumentHistory.findMany.mockResolvedValue([]);
      prisma.sinaesDocumentHistory.count.mockResolvedValue(0);

      await service.getRecentChanges({
        dateFrom: '2024-01-01' as any,
        dateTo: '2024-12-31' as any,
        page: 1,
        limit: 10,
      });

      const where = prisma.sinaesDocumentHistory.findMany.mock.calls[0][0].where;
      expect(where.createdAt.gte).toBeDefined();
      expect(where.createdAt.lte).toBeDefined();
    });

    it('debe filtrar por fieldChanged si se proporciona', async () => {
      prisma.sinaesDocumentHistory.findMany.mockResolvedValue([]);
      prisma.sinaesDocumentHistory.count.mockResolvedValue(0);

      await service.getRecentChanges({ fieldChanged: 'name', page: 1, limit: 10 });

      const where = prisma.sinaesDocumentHistory.findMany.mock.calls[0][0].where;
      expect(where.fieldChanged).toBe('name');
    });

    it('debe usar valores por defecto page=1 limit=20 cuando no se pasan filtros', async () => {
      prisma.sinaesDocumentHistory.findMany.mockResolvedValue([]);
      prisma.sinaesDocumentHistory.count.mockResolvedValue(0);

      await service.getRecentChanges();

      expect(prisma.sinaesDocumentHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });
  });

  // ── getActivityStatistics ─────────────────────────────────────────────────

  describe('getActivityStatistics', () => {
    beforeEach(() => {
      prisma.sinaesDocumentHistory.count.mockResolvedValue(5);
      prisma.sinaesDocumentHistory.groupBy.mockResolvedValue([
        { changeType: 'CREATED', _count: 3 },
        { changeType: 'UPDATED', _count: 2 },
      ]);
      prisma.sinaesDocumentHistory.findMany.mockResolvedValue([
        { createdAt: new Date('2024-06-01T10:00:00Z') },
        { createdAt: new Date('2024-06-01T12:00:00Z') },
        { createdAt: new Date('2024-06-02T09:00:00Z') },
      ]);
    });

    it('debe retornar estadísticas globales sin documentId', async () => {
      prisma.user.findUnique.mockResolvedValue({ fullName: 'Ana', fullLastName: 'García' });
      // groupBy para topUsers
      prisma.sinaesDocumentHistory.groupBy
        .mockResolvedValueOnce([{ changeType: 'CREATED', _count: 3 }]) // changesByType
        .mockResolvedValueOnce([{ userId: 'user-1', _count: 3 }]); // topUsers

      const resultado = await service.getActivityStatistics();

      expect(resultado.totalChanges).toBe(5);
      expect(resultado.changesByType).toBeDefined();
      expect(resultado.topUsers).toBeDefined();
      expect(resultado.recentActivity).toBeDefined();
    });

    it('debe filtrar por documentId cuando se proporciona', async () => {
      prisma.sinaesDocumentHistory.groupBy
        .mockResolvedValueOnce([{ changeType: 'UPDATED', _count: 2 }])
        .mockResolvedValueOnce([{ userId: 'user-1', _count: 2 }]);
      prisma.user.findUnique.mockResolvedValue({ fullName: 'Ana', fullLastName: 'García' });

      await service.getActivityStatistics('doc-1');

      expect(prisma.sinaesDocumentHistory.count).toHaveBeenCalledWith({ where: { documentId: 'doc-1' } });
    });

    it('debe mostrar "Usuario desconocido" si el userId no existe en la BD', async () => {
      prisma.sinaesDocumentHistory.groupBy
        .mockResolvedValueOnce([{ changeType: 'CREATED', _count: 1 }])
        .mockResolvedValueOnce([{ userId: 'user-eliminado', _count: 1 }]);
      prisma.user.findUnique.mockResolvedValue(null); // usuario no encontrado

      const resultado = await service.getActivityStatistics();

      expect(resultado.topUsers[0].userName).toBe('Usuario desconocido');
    });

    it('debe agrupar actividad reciente por día correctamente', async () => {
      prisma.sinaesDocumentHistory.groupBy
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const resultado = await service.getActivityStatistics();

      // 2 entradas para el 2024-06-01, 1 para el 2024-06-02
      const fechas = resultado.recentActivity.map((r) => r.date);
      expect(fechas).toContain('2024-06-01');
      expect(fechas).toContain('2024-06-02');

      const dia1 = resultado.recentActivity.find((r) => r.date === '2024-06-01');
      expect(dia1?.count).toBe(2);
    });
  });

  // ── detectChanges ─────────────────────────────────────────────────────────

  describe('detectChanges', () => {
    it('debe detectar cambios en campos que cambiaron', () => {
      const old = { name: 'Viejo', description: 'Desc vieja' };
      const nuevo = { name: 'Nuevo', description: 'Desc vieja' };

      const cambios = service.detectChanges(old, nuevo);

      expect(cambios).toHaveLength(1);
      expect(cambios[0]).toMatchObject({ field: 'name', oldValue: 'Viejo', newValue: 'Nuevo' });
    });

    it('no debe detectar cambio si el valor es el mismo', () => {
      const old = { name: 'Igual' };
      const nuevo = { name: 'Igual' };

      const cambios = service.detectChanges(old, nuevo);
      expect(cambios).toHaveLength(0);
    });

    it('debe ignorar campos de auditoría (id, createdAt, updatedAt)', () => {
      const old = { id: 'abc', createdAt: new Date(), updatedAt: new Date() };
      const nuevo = { id: 'xyz', createdAt: new Date(), updatedAt: new Date() };

      const cambios = service.detectChanges(old, nuevo);
      expect(cambios).toHaveLength(0);
    });

    it('no debe incluir campos con newValue undefined', () => {
      const old = { name: 'Viejo', status: 'ACTIVE' };
      const nuevo = { name: 'Nuevo' }; // status no se actualiza

      const cambios = service.detectChanges(old, nuevo);
      expect(cambios).toHaveLength(1);
      expect(cambios[0].field).toBe('name');
    });

    it('debe serializar objetos como JSON', () => {
      const old = { metadata: { clave: 'valor1' } };
      const nuevo = { metadata: { clave: 'valor2' } };

      const cambios = service.detectChanges(old, nuevo);
      expect(cambios).toHaveLength(1);
      expect(cambios[0].oldValue).toBe('{"clave":"valor1"}');
      expect(cambios[0].newValue).toBe('{"clave":"valor2"}');
    });

    it('debe serializar null/undefined como string vacío', () => {
      const old = { description: null };
      const nuevo = { description: 'Nueva descripción' };

      const cambios = service.detectChanges(old, nuevo);
      expect(cambios[0].oldValue).toBe('');
    });
  });
});
