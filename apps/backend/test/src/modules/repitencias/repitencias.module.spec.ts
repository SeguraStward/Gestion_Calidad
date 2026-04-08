import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard, PermissionsGuard } from '@src/modules/auth/guards';
import { AuditFieldsGuard } from '@src/core/http/guards';
import { PrismaService } from '@src/prisma/prisma.service';
import { DtoValidator } from '@core/common/dto-validator';

import { RepitenciasModule } from '@modules/repitencias/repitencias.module';
import { RepitenciasRepository } from '@modules/repitencias/repitencias.repository';

describe('RepitenciasModule (Modular)', () => {
  let app: INestApplication;
  let repository: jest.Mocked<RepitenciasRepository>;

  const mockEntity = {
    id: 'repitencia-1',
    campusId: 'campus',
    courseId: 'course',
    academicCycleId: 'cycle',
    campusAllocationId: 'allocation',
    courseName: 'name',
    courseCode: 'code',
    careerName: 'career',
    additionalHours: 4,
    status: 'ACTIVE',
  };

  const mockRepository = {
    save: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    deleteById: jest.fn(),
    findByCampus: jest.fn(),
    findByCourse: jest.fn(),
    findByAcademicCycle: jest.fn(),
    findByCampusAllocation: jest.fn(),
    calculateTotalAdditionalHours: jest.fn(),
    getStatistics: jest.fn(),
  };

  const mockDtoValidator = {
    validate: jest.fn().mockImplementation((payload, cls) => payload),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [RepitenciasModule],
    })
      .overrideProvider(RepitenciasRepository).useValue(mockRepository)
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

    repository = moduleFixture.get<RepitenciasRepository>(RepitenciasRepository) as any;
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Flujos HTTP - Repitencias', () => {
    it('POST /repitencias — Crea registro — responde 201', async () => {
      const createDto = {
        campusId: 'campus',
        courseId: 'course',
        academicCycleId: 'cycle',
        campusAllocationId: 'allocation',
        courseName: 'name',
        courseCode: 'code',
        careerName: 'career',
        additionalHours: 4
      };
      repository.save.mockResolvedValue(mockEntity as any);

      const response = await request(app.getHttpServer())
        .post('/repitencias')
        .send(createDto);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(repository.save).toHaveBeenCalled();
    });

    it('GET /repitencias — Lista registros — responde 200', async () => {
      repository.findAll.mockResolvedValue({ data: [mockEntity as any], meta: { total: 1 } } as any);

      const response = await request(app.getHttpServer())
        .get('/repitencias?page=1&limit=10')
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('GET /repitencias/:id — Obtiene un registro — responde 200', async () => {
      repository.findById.mockResolvedValue(mockEntity as any);

      const response = await request(app.getHttpServer())
        .get('/repitencias/repitencia-1')
        .expect(200);

      expect(response.body.id).toBe('repitencia-1');
    });

    it('PUT /repitencias/:id — Actualiza registro — responde 204 o 200', async () => {
      const updateDto = { additionalHours: 5 };
      repository.update.mockResolvedValue({ ...mockEntity, ...updateDto } as any);

      const res = await request(app.getHttpServer())
        .put('/repitencias/repitencia-1')
        .send(updateDto);

      expect([200, 204]).toContain(res.status);
    });

    it('DELETE /repitencias/:id — Elimina registro — responde 200 o 204', async () => {
      repository.deleteById.mockResolvedValue(true);
      repository.findById.mockResolvedValue(mockEntity as any);

      const res = await request(app.getHttpServer())
        .delete('/repitencias/repitencia-1');

      expect([200, 204]).toContain(res.status);
    });
  });
});
