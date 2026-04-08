import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard, PermissionsGuard } from '@src/modules/auth/guards';
import { AuditFieldsGuard } from '@src/core/http/guards';
import { PrismaService } from '@src/prisma/prisma.service';
import { QuestionGroupsModule } from '@modules/question-groups/question-groups.module';
import { QuestionGroupsRepository } from '@modules/question-groups/question-groups.repository';
import { DtoValidator } from '@core/common/dto-validator';

describe('QuestionGroupsModule (Modular)', () => {
  let app: INestApplication;
  let repository: jest.Mocked<QuestionGroupsRepository>;

  const mockEntity = {
    id: 'test-id-1',
    name: 'Test QuestionGroups',
    status: 'ACTIVE',
  };

  const mockRepository = {
    save: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    deleteById: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
    existsByName: jest.fn().mockResolvedValue(false),
    existsByCode: jest.fn().mockResolvedValue(false),
          };

  const mockDtoValidator = {
    validate: jest.fn().mockImplementation((payload, cls) => payload),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [QuestionGroupsModule],
    })
      .overrideProvider(QuestionGroupsRepository).useValue(mockRepository)
      .overrideProvider(DtoValidator).useValue(mockDtoValidator)
      .overrideProvider(PrismaService).useValue({ question: { count: jest.fn().mockResolvedValue(0) } })
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

    repository = moduleFixture.get<QuestionGroupsRepository>(QuestionGroupsRepository) as any;
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Flujos HTTP - QuestionGroups', () => {
    it('POST /question-groups — Crea registro — responde 201', async () => {
      const createDto = { name: 'Test QuestionGroups' };
      repository.save.mockResolvedValue(mockEntity as any);
      repository.create.mockResolvedValue(mockEntity as any);
      repository.findById.mockResolvedValue(mockEntity as any);

      const response = await request(app.getHttpServer())
        .post('/question-groups')
        .send(createDto);
        
      if (response.status !== 201) console.log(response.body);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(repository.save.mock.calls.length > 0 || repository.create.mock.calls.length > 0).toBeTruthy();
    });

    it('GET /question-groups — Lista registros — responde 200', async () => {
      repository.findAll.mockResolvedValue({ data: [mockEntity as any], meta: { total: 1 } } as any);

      const response = await request(app.getHttpServer())
        .get('/question-groups?page=1&limit=10')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
    });

    it('GET /question-groups/:id — Obtiene un registro — responde 200', async () => {
      repository.findById.mockResolvedValue(mockEntity as any);

      const response = await request(app.getHttpServer())
        .get('/question-groups/test-id-1')
        .expect(200);

      expect(response.body.id).toBe('test-id-1');
    });

    it('PUT /question-groups/:id — Actualiza registro — responde 204 o 200', async () => {
      const updateDto = { name: 'Updated' };
      repository.update.mockResolvedValue({ ...mockEntity, ...updateDto } as any);

      const res = await request(app.getHttpServer())
        .put('/question-groups/test-id-1')
        .send(updateDto);

      if (res.status !== 200 && res.status !== 204) throw new Error('Expected status 200 or 204, got ' + res.status);
    });

    it('DELETE /question-groups/:id — Elimina registro — responde 200 o 204', async () => {
      repository.deleteById.mockResolvedValue(true);
      repository.delete.mockResolvedValue(true as any);
      repository.findById.mockResolvedValue(mockEntity as any);

      const res = await request(app.getHttpServer())
        .delete('/question-groups/test-id-1');

      if (res.status !== 200 && res.status !== 204) throw new Error('Expected status 200 or 204, got ' + res.status);
    });
  });
});
