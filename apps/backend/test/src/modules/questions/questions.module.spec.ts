import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';

import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard, PermissionsGuard } from '@src/modules/auth/guards';
import { AuditFieldsGuard } from '@src/core/http/guards';
import { PrismaService } from '@src/prisma/prisma.service';
import { DtoValidator } from '@core/common/dto-validator';

import { QuestionsModule } from '@modules/questions/questions.module';
import { QuestionsRepository } from '@modules/questions/questions.repository';

describe('QuestionsModule (Modular)', () => {
  let app: INestApplication;
  let repository: jest.Mocked<QuestionsRepository>;

  const mockQuestion = {
    id: 'question-1',
    question: 'Test Question?',
    stepNumber: 1,
    groupId: 'group-1',
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
      imports: [QuestionsModule],
    })
      .overrideProvider(QuestionsRepository)
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

    repository = moduleFixture.get<QuestionsRepository>(QuestionsRepository) as any;
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Flujos HTTP - Questions', () => {
    it('POST /questions — Crea pregunta — responde 201', async () => {
      const createDto = {
        question: 'Test Question?',
        stepNumber: 1,
        responseType: 'TEXT',
        appliesTo: ['FINAL_REPORT'],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      repository.save.mockResolvedValue(mockQuestion as any);

      const response = await request(app.getHttpServer())
        .post('/questions')
        .send(createDto);

      if (response.status !== 201) console.log(response.body);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('question');
      expect(repository.save).toHaveBeenCalled();
    });

    it('GET /questions — Lista preguntas — responde 200', async () => {
      repository.findAll.mockResolvedValue({ data: [mockQuestion as any], meta: { total: 1 } } as any);

      const response = await request(app.getHttpServer())
        .get('/questions?page=1&limit=10')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
    });

    it('PUT /questions/:id — Actualiza pregunta — responde 204 o 200', async () => {
      const updateDto = { text: 'Updated' };
      repository.update.mockResolvedValue({ ...mockQuestion, ...updateDto } as any);

      const res = await request(app.getHttpServer())
        .put('/questions/question-1')
        .send(updateDto);

      if (res.status !== 200 && res.status !== 204) throw new Error('Expected status 200 or 204');
    });

    it('DELETE /questions/:id — Elimina pregunta — responde 200 o 204', async () => {
      repository.findById.mockResolvedValue(mockQuestion as any);
      repository.deleteById.mockResolvedValue(true);

      const res = await request(app.getHttpServer())
        .delete('/questions/question-1');

      if (res.status !== 200 && res.status !== 204) throw new Error('Expected status 200 or 204, got: ' + res.status);
    });
  });
});
