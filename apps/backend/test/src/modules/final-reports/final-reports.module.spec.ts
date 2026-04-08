import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';

import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard, PermissionsGuard } from '@src/modules/auth/guards';
import { AuditFieldsGuard } from '@src/core/http/guards';
import { PrismaService } from '@src/prisma/prisma.service';
import { DtoValidator } from '@core/common/dto-validator';

import { FinalReportsModule } from '@modules/final-reports/final-reports.module';
import { FinalReportsRepository } from '@modules/final-reports/final-reports.repository';

describe('FinalReportsModule (Modular)', () => {
  let app: INestApplication;
  let repository: jest.Mocked<FinalReportsRepository>;

  const mockReport = {
    id: 'report-1',
    projectId: 'project-1',
    cohortId: 'cohort-1',
    status: 'ACTIVE',
  };

  const mockRepository = {
    save: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    deleteById: jest.fn(),
    count: jest.fn(),
  };

  const mockDtoValidator = {
    validate: jest.fn().mockImplementation((entity) => entity),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [FinalReportsModule],
    })
      .overrideProvider(FinalReportsRepository)
      .useValue(mockRepository)
      .overrideProvider(DtoValidator)
      .useValue(mockDtoValidator)
      .overrideProvider(PrismaService)
      .useValue({})
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

    repository = moduleFixture.get<FinalReportsRepository>(FinalReportsRepository) as any;
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Flujos HTTP - Final Reports', () => {
    it('POST /final-reports — Crea reporte — responde 201', async () => {
      const createDto = {
        projectId: 'project-1',
        cohortId: 'cohort-1',
      };

      repository.save.mockResolvedValue(mockReport as any);

      const response = await request(app.getHttpServer())
        .post('/final-reports')
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(repository.save).toHaveBeenCalled();
    });

    it('GET /final-reports — Lista reportes — responde 200', async () => {
      repository.findAll.mockResolvedValue({ data: [mockReport as any], meta: { total: 1 } } as any);

      const response = await request(app.getHttpServer())
        .get('/final-reports?page=1&limit=10')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta.total).toBe(1);
    });

    it('GET /final-reports/:id — Obtiene un reporte — responde 200', async () => {
      repository.findById.mockResolvedValue(mockReport as any);

      const response = await request(app.getHttpServer())
        .get('/final-reports/report-1')
        .expect(200);

      expect(response.body.id).toBe('report-1');
    });

    it('PUT /final-reports/:id — Actualiza reporte — responde 204 o 200', async () => {
      const updateDto = { customName: 'test' };
      repository.update.mockResolvedValue({ ...mockReport, ...updateDto } as any);

      const res = await request(app.getHttpServer())
        .put('/final-reports/report-1')
        .send(updateDto);

      if (res.status !== 200 && res.status !== 204) {
        console.log('PUT response:', res.body);
        throw new Error('Expected status 200 or 204, got ' + res.status);
      }
    });

    it('DELETE /final-reports/:id — Elimina reporte — responde 200 o 204', async () => {
      repository.deleteById.mockResolvedValue(true);

      const res = await request(app.getHttpServer())
        .delete('/final-reports/report-1');

      if (res.status !== 200 && res.status !== 204) throw new Error('Expected status 200 or 204');
    });
  });
});
