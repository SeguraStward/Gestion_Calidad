import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard, PermissionsGuard } from '@src/modules/auth/guards';
import { AuditFieldsGuard } from '@src/core/http/guards';
import { PrismaService } from '@src/prisma/prisma.service';
import { DtoValidator } from '@core/common/dto-validator';

import { TimesModule } from '@modules/times/times.module';
import { TimesRepository } from '@modules/times/times.repository';

describe('TimesModule (Modular)', () => {
  let app: INestApplication;
  let repository: jest.Mocked<TimesRepository>;

  const mockEntity = {
    id: 'time-1',
    name: 'Test Times',
    status: 'ACTIVE',
  };

  const mockRepository = {
    create: jest.fn(),
  };

  const mockDtoValidator = {
    validate: jest.fn().mockImplementation((payload, cls) => payload),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TimesModule],
    })
      .overrideProvider(TimesRepository).useValue(mockRepository)
      .overrideProvider(DtoValidator).useValue(mockDtoValidator)
      .overrideProvider(PrismaService).useValue({})
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

    repository = moduleFixture.get<TimesRepository>(TimesRepository) as any;
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Flujos HTTP - Times', () => {
    it('POST /times — Crea registro', async () => {
      const createDto = {
        campus: 'Central',
        mesh: 'Malla A',
        cycle: '2',
        allocatedTime: 10
      };
      repository.create.mockResolvedValue({ id: 'dummy', ...createDto } as any);

      const response = await request(app.getHttpServer())
        .post('/times')
        .send(createDto);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('GET /times/ping — Ping OK', async () => {
      const response = await request(app.getHttpServer())
        .get('/times/ping')
        .expect(200);

      expect(response.body.message).toBeDefined();
    });

    it('GET /times/mock-campus — Retorna mocs', async () => {
      const response = await request(app.getHttpServer())
        .get('/times/mock-campus')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });
  });
});
