import { ExecutionContext } from '@nestjs/common';
import { PermissionsGuard } from '@src/modules/auth/guards';
import { AuditFieldsGuard } from '@src/core/http/guards';
import { JwtAuthGuard } from '@src/modules/auth/guards'; 
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { CohortsModule } from '@modules/cohorts/cohorts.module';
import { CohortsRepository } from '@modules/cohorts/cohorts.repository';
import { PrismaService } from '@src/prisma/prisma.service';

describe('CohortsModule (Modular)', () => {
  let app: INestApplication;
  let cohortsRepository: jest.Mocked<CohortsRepository>;

  const mockCohort = {
    id: 'cohort-1',
    careerId: 'uuid-career',
    year: 2025,
    group: 'A',
    initialStudents: 40,
    status: 'ACTIVE',
  };

  const mockCohortsRepository = {
    save: jest.fn(),
    findAllWithCareer: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    deleteById: jest.fn(),
    count: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CohortsModule],
    })
      .overrideProvider(CohortsRepository)
      .useValue(mockCohortsRepository)
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: (ctx: ExecutionContext) => { ctx.switchToHttp().getRequest().user = { id: "test", email: "test@x.com" }; return true; } })
      .overrideGuard(AuditFieldsGuard).useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard).useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: (ctx: ExecutionContext) => { ctx.switchToHttp().getRequest().user = { id: "test", email: "test@x.com" }; return true; } })
      .overrideGuard(AuditFieldsGuard).useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard).useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    cohortsRepository = moduleFixture.get<CohortsRepository>(CohortsRepository) as any;
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Flujos HTTP - Cohorts', () => {
    it('POST /cohorts — Crea cohorte — responde 201', async () => {
      const createDto = {
        careerId: 'uuid-career',
        year: 2025,
        group: 'A',
        initialStudents: 40,
      };

      cohortsRepository.save.mockResolvedValue(mockCohort as any);

      const response = await request(app.getHttpServer())
        .post('/cohorts')
        .send(createDto)
        .expect(201);

      expect(response.body).toEqual(mockCohort);
      expect(cohortsRepository.save).toHaveBeenCalled();
    });

    it('GET /cohorts — Lista cohortes — responde 200', async () => {
      cohortsRepository.findAllWithCareer.mockResolvedValue([mockCohort] as any);

      const response = await request(app.getHttpServer())
        .get('/cohorts')
        .expect(200);

      expect(response.body).toEqual([mockCohort]);
      expect(cohortsRepository.findAllWithCareer).toHaveBeenCalled();
    });

    it('GET /cohorts/:id — Obtiene por ID — responde 200', async () => {
      cohortsRepository.findById.mockResolvedValue(mockCohort as any);

      const response = await request(app.getHttpServer())
        .get('/cohorts/cohort-1')
        .expect(200);

      expect(response.body).toEqual(mockCohort);
      expect(cohortsRepository.findById).toHaveBeenCalledWith('cohort-1');
    });

    it('GET /cohorts/:id — ID inexistente — responde 404', async () => {
      cohortsRepository.findById.mockResolvedValue(null as any);

      await request(app.getHttpServer())
        .get('/cohorts/non-existent')
        .expect(404);

      expect(cohortsRepository.findById).toHaveBeenCalledWith('non-existent');
    });

    it('PATCH/PUT /cohorts/:id — Actualiza — responde 200', async () => {
      const updateDto = { group: 'B' };
      const updatedCohort = { ...mockCohort, group: 'B' };

      // GenericController/GenericService uses findById to check existence before updating
      cohortsRepository.findById.mockResolvedValue(mockCohort as any);
      cohortsRepository.update.mockResolvedValue(updatedCohort as any);

      const response = await request(app.getHttpServer())
        .put('/cohorts/cohort-1')
        .send(updateDto)
        .expect(200);

      expect(response.body).toEqual(updatedCohort);
      expect(cohortsRepository.update).toHaveBeenCalledWith('cohort-1', updateDto);
    });

    it('DELETE /cohorts/:id — Elimina — responde 200', async () => {
      cohortsRepository.findById.mockResolvedValue(mockCohort as any);
      cohortsRepository.deleteById.mockResolvedValue(mockCohort as any);

      const response = await request(app.getHttpServer())
        .delete('/cohorts/cohort-1')
        .expect(200);

      expect(response.body).toEqual(mockCohort);
      expect(cohortsRepository.deleteById).toHaveBeenCalledWith('cohort-1');
    });
  });
});
