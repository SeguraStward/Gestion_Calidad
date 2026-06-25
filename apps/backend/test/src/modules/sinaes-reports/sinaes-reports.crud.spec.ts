import { Test, TestingModule } from '@nestjs/testing';
import { Logger, NotFoundException } from '@nestjs/common';
import { SinaesReportsService } from '@modules/sinaes-reports/sinaes-reports.service';
import { PdfGeneratorService } from '@modules/sinaes-reports/pdf-generator.service';
import { PrismaService } from '@src/prisma/prisma.service';

/**
 * Pruebas unitarias del CRUD de reportes de cumplimiento guardados:
 * consultar por id, listar con paginación y eliminar (soft-delete). Prisma
 * está mockeado; no hay base de datos.
 */
describe('SinaesReportsService — reportes guardados (Unitaria)', () => {
  let service: SinaesReportsService;
  let prisma: jest.Mocked<PrismaService>;

  const mockPrismaService = () => ({
    sinaesComplianceReport: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SinaesReportsService,
        { provide: PrismaService, useFactory: mockPrismaService },
        { provide: PdfGeneratorService, useFactory: () => ({}) },
      ],
    }).compile();

    service = module.get<SinaesReportsService>(SinaesReportsService);
    prisma = module.get(PrismaService) as any;

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  describe('getReportById', () => {
    it('devuelve el reportData almacenado cuando el reporte existe', async () => {
      const stored = { reportName: 'Trimestral Q1', statistics: { overallCompliance: 80 } };
      (prisma.sinaesComplianceReport.findUnique as jest.Mock).mockResolvedValue({
        id: 'report-1',
        reportData: stored,
      });

      const result = await service.getReportById('report-1');

      expect(result).toEqual(stored);
    });

    it('lanza NotFoundException cuando el reporte no existe', async () => {
      (prisma.sinaesComplianceReport.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getReportById('inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('listReports', () => {
    it('lista reportes activos con metadata de paginación', async () => {
      (prisma.sinaesComplianceReport.findMany as jest.Mock).mockResolvedValue([
        { id: 'r1' },
        { id: 'r2' },
      ]);
      (prisma.sinaesComplianceReport.count as jest.Mock).mockResolvedValue(12);

      const result = await service.listReports(2, 5);

      expect(result.data).toHaveLength(2);
      expect(result.meta).toEqual({
        total: 12,
        page: 2,
        limit: 5,
        totalPages: 3,
      });
      // Verifica que respeta el offset de la página 2 (skip = (2-1)*5).
      expect(prisma.sinaesComplianceReport.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 }),
      );
    });
  });

  describe('deleteReport', () => {
    it('hace soft-delete marcando el estado como INACTIVE', async () => {
      (prisma.sinaesComplianceReport.update as jest.Mock).mockResolvedValue({});

      await service.deleteReport('report-1');

      expect(prisma.sinaesComplianceReport.update).toHaveBeenCalledWith({
        where: { id: 'report-1' },
        data: { status: 'INACTIVE' },
      });
    });
  });
});
