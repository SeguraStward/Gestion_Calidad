import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';

import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard, PermissionsGuard } from '@src/modules/auth/guards';
import { AuditFieldsGuard } from '@src/core/http/guards';
import { PrismaService } from '@src/prisma/prisma.service';
import { DtoValidator } from '@core/common/dto-validator';

import { StandardEvidencesModule } from '@modules/standard-evidences/standard-evidences.module';
import { StandardEvidencesRepository } from '@modules/standard-evidences/standard-evidences.repository';

describe('StandardEvidencesModule (Modular)', () => {
  let app: INestApplication;
  let repository: jest.Mocked<StandardEvidencesRepository>;

  const mockEvidence = {
    id: 's-ev-1',
    documentId: 'doc-1',
    standardId: 'std-1',
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
      imports: [StandardEvidencesModule],
    })
      .overrideProvider(StandardEvidencesRepository)
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

    repository = moduleFixture.get<StandardEvidencesRepository>(StandardEvidencesRepository) as any;
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Flujos HTTP - Standard Evidences', () => {
    it('POST /standard-evidences — Crea evidencia estándar — responde 201', async () => {
      const createDto = { documentId: 'doc-1', standardId: 'std-1' };
      repository.save.mockResolvedValue(mockEvidence as any);

      const response = await request(app.getHttpServer())
        .post('/standard-evidences')
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(repository.save).toHaveBeenCalled();
    });

    it('GET /standard-evidences — Lista evidencias estándar — responde 200', async () => {
      repository.findAll.mockResolvedValue({ data: [mockEvidence as any], meta: { total: 1 } } as any);

      const response = await request(app.getHttpServer())
        .get('/standard-evidences?page=1&limit=10')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
    });

    it('PUT /standard-evidences/:id — Actualiza evidencia — responde 204 o 200', async () => {
      const updateDto = { documentId: 'doc-2' };
      repository.update.mockResolvedValue({ ...mockEvidence, ...updateDto } as any);

      const res = await request(app.getHttpServer())
        .put('/standard-evidences/s-ev-1')
        .send(updateDto);

      if (res.status !== 200 && res.status !== 204) throw new Error('Expected status 200 or 204');
    });

    it('DELETE /standard-evidences/:id — Elimina evidencia — responde 200 o 204', async () => {
      repository.findById.mockResolvedValue(mockEvidence as any);
      repository.deleteById.mockResolvedValue(true);

      const res = await request(app.getHttpServer())
        .delete('/standard-evidences/s-ev-1');

      if (res.status !== 200 && res.status !== 204) throw new Error('Expected status 200 or 204, got: ' + res.status);
    });
  });
});
