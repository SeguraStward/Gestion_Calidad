import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';

import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard, PermissionsGuard } from '@src/modules/auth/guards';
import { AuditFieldsGuard } from '@src/core/http/guards';
import { PrismaService } from '@src/prisma/prisma.service';

// Mock simple for puppeteer to avoid runtime errors during testing
jest.mock('puppeteer', () => ({
  launch: jest.fn().mockResolvedValue({
    newPage: jest.fn().mockResolvedValue({
      setContent: jest.fn(),
      setViewport: jest.fn(),
      pdf: jest.fn().mockResolvedValue(Buffer.from('PDF_CONTENT')),
    }),
    close: jest.fn(),
  }),
}));

import { SinaesReportsModule } from '@modules/sinaes-reports/sinaes-reports.module';

describe('SinaesReportsModule (Modular)', () => {
  let app: INestApplication;
  let prisma: jest.Mocked<PrismaService>;

  const mockReport = {
    id: 'report-1',
    reportName: 'Reporte SINAES',
    status: 'ACTIVE',
  };

  const mockPrismaService = {
    dimension: {
      findMany: jest.fn(),
    },
    sinaesComplianceReport: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SinaesReportsModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideGuard(JwtAuthGuard).useValue({
        canActivate: (ctx: ExecutionContext) => {
          ctx.switchToHttp().getRequest().user = { id: 'admin-1', email: 'admin@una.cr' };
          return true;
        }
      })
      .overrideGuard(AuditFieldsGuard).useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard).useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService) as any;
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Flujos HTTP - Sinaes Reports', () => {
    it('GET /sinaes-reports/compliance — Genera reporte — responde 200', async () => {
      mockPrismaService.dimension.findMany.mockResolvedValue([]);
      mockPrismaService.sinaesComplianceReport.create.mockResolvedValue(mockReport as any);

      const response = await request(app.getHttpServer())
        .get('/sinaes-reports/compliance?dimensionId=dim-1')
        .expect(200);

      expect(response.body).toHaveProperty('statistics');
      expect(mockPrismaService.dimension.findMany).toHaveBeenCalled();
    });

    it('GET /sinaes-reports/compliance/list/all — Lista reportes guardados — responde 200', async () => {
      mockPrismaService.sinaesComplianceReport.findMany.mockResolvedValue([mockReport] as any);
      mockPrismaService.sinaesComplianceReport.count.mockResolvedValue(1);

      const response = await request(app.getHttpServer())
        .get('/sinaes-reports/compliance/list/all?page=1&limit=10')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
    });

    it('GET /sinaes-reports/compliance/:id — Obtiene un reporte guardado — responde 200', async () => {
      mockPrismaService.sinaesComplianceReport.findUnique.mockResolvedValue(mockReport as any);

      const response = await request(app.getHttpServer())
        .get('/sinaes-reports/compliance/report-1')
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('DELETE /sinaes-reports/compliance/:id — Elimina reporte — responde 204 o 200', async () => {
      mockPrismaService.sinaesComplianceReport.findUnique.mockResolvedValue(mockReport as any);
      mockPrismaService.sinaesComplianceReport.update.mockResolvedValue(mockReport as any); // Soft delete uses update typically

      const res = await request(app.getHttpServer())
        .delete('/sinaes-reports/compliance/report-1');

      if (res.status !== 200 && res.status !== 204 && res.status !== 201) throw new Error('Expected successful deletion status');
    });
  });
});
