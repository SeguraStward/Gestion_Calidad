import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';

import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard, PermissionsGuard } from '@src/modules/auth/guards';
import { AuditFieldsGuard } from '@src/core/http/guards';
import { PrismaService } from '@src/prisma/prisma.service';

import { SinaesDocumentHistoryModule } from '@modules/sinaes-document-history/sinaes-document-history.module';

describe('SinaesDocumentHistoryModule (Modular)', () => {
  let app: INestApplication;
  let prisma: jest.Mocked<PrismaService>;

  const mockHistory = {
    id: 'hist-1',
    documentId: 'doc-1',
    userId: 'user-1',
    changeType: 'CREATED',
    createdAt: new Date(),
  };

  const mockPrismaService = {
    sinaesDocumentHistory: {
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SinaesDocumentHistoryModule],
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

  describe('Flujos HTTP - Sinaes Document History', () => {
    it('GET /sinaes-document-history/document/:documentId — Obtiene historial del doc — responde 200', async () => {
      mockPrismaService.sinaesDocumentHistory.findMany.mockResolvedValue([mockHistory] as any);
      mockPrismaService.sinaesDocumentHistory.count.mockResolvedValue(1);

      const response = await request(app.getHttpServer())
        .get('/sinaes-document-history/document/doc-1?page=1&limit=10')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
    });

    it('GET /sinaes-document-history/user/:userId — Obtiene actividad del user — responde 200', async () => {
      mockPrismaService.sinaesDocumentHistory.findMany.mockResolvedValue([mockHistory] as any);
      mockPrismaService.sinaesDocumentHistory.count.mockResolvedValue(1);

      const response = await request(app.getHttpServer())
        .get('/sinaes-document-history/user/user-1?page=1&limit=10')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
    });

    it('GET /sinaes-document-history/recent — Obtiene historial reciente global — responde 200', async () => {
      mockPrismaService.sinaesDocumentHistory.findMany.mockResolvedValue([mockHistory] as any);

      const response = await request(app.getHttpServer())
        .get('/sinaes-document-history/recent?limit=5')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
    });

    it('GET /sinaes-document-history/statistics — Obtiene estadísticas — responde 200', async () => {
      mockPrismaService.sinaesDocumentHistory.groupBy.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/sinaes-document-history/statistics')
        .expect(200);

      expect(response.body).toHaveProperty('changesByType');
      expect(response.body).toHaveProperty('topUsers');
    });
  });
});
