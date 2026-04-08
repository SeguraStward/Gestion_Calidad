import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard, PermissionsGuard } from '@src/modules/auth/guards';
import { AuditFieldsGuard } from '@src/core/http/guards';
import { PrismaService } from '@src/prisma/prisma.service';
import { DtoValidator } from '@core/common/dto-validator';

import { JourneyTimeConfigsModule } from '@modules/journey-time-configs/journey-time-configs.module';
import { JourneyTimeConfigsRepository } from '@modules/journey-time-configs/journey-time-configs.repository';

describe('JourneyTimeConfigsModule (Modular)', () => {
  let app: INestApplication;
  let repository: jest.Mocked<JourneyTimeConfigsRepository>;

  const mockEntity = {
    effectiveYear: 2024,
    quarterTimeMinHours: 1, quarterTimeMaxHours: 2,
    halfTimeMinHours: 3, halfTimeMaxHours: 4,
    threeQuarterMinHours: 5, threeQuarterMaxHours: 6,
    fullTimeMinHours: 7,
    quarterTimeValue: 1,
    halfTimeValue: 2,
    threeQuarterTimeValue: 3,
    fullTimeValue: 4,
    id: 'config-1',
    name: 'Test JourneyTimeConfigs',
    status: 'ACTIVE',
  };

  const mockRepository = {
    save: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    deleteById: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };

  const mockDtoValidator = {
    validate: jest.fn().mockImplementation((payload, cls) => payload),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [JourneyTimeConfigsModule],
    })
      .overrideProvider(JourneyTimeConfigsRepository).useValue(mockRepository)
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

    repository = moduleFixture.get<JourneyTimeConfigsRepository>(JourneyTimeConfigsRepository) as any;
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Flujos HTTP - JourneyTimeConfigs', () => {
    it('POST /journey-time-configs — Crea registro — responde 201', async () => {
      const createDto = {
        effectiveYear: 2024,
        quarterTimeMinHours: 1, quarterTimeMaxHours: 2,
        halfTimeMinHours: 3, halfTimeMaxHours: 4,
        threeQuarterMinHours: 5, threeQuarterMaxHours: 6,
        fullTimeMinHours: 7,
        quarterTimeValue: 1,
        halfTimeValue: 2,
        threeQuarterTimeValue: 3,
        fullTimeValue: 4,
      };
      repository.create.mockResolvedValue(mockEntity as any);
      repository.findById.mockResolvedValue(mockEntity as any);

      const response = await request(app.getHttpServer())
        .post('/journey-time-configs')
        .send(createDto);
        
      if (response.status !== 201) console.log(response.body);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('effectiveYear');
      expect(repository.create).toHaveBeenCalled();
    });

    it('GET /journey-time-configs — Lista registros — responde 200', async () => {
      repository.findAll.mockResolvedValue({ data: [mockEntity as any], meta: { total: 1 } } as any);

      const response = await request(app.getHttpServer())
        .get('/journey-time-configs?page=1&limit=10')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
    });

    it.skip('GET /journey-time-configs/:id — Obtiene un registro — responde 200', async () => {
      repository.findById.mockResolvedValue(mockEntity as any);

      const response = await request(app.getHttpServer())
        .get('/journey-time-configs/config-1')
        .expect(200);

      expect(response.body.id).toBe('config-1');
    });

    it('PUT /journey-time-configs/:id — Actualiza registro — responde 204 o 200', async () => {
      const updateDto = { name: 'Updated' };
      repository.update.mockResolvedValue({ ...mockEntity, ...updateDto } as any);

      const res = await request(app.getHttpServer())
        .put('/journey-time-configs/config-1')
        .send(updateDto);

      if (res.status !== 200 && res.status !== 204) throw new Error('Expected status 200 or 204, got ' + res.status);
    });

    it('DELETE /journey-time-configs/:id — Elimina registro — responde 200 o 204', async () => {
      repository.delete.mockResolvedValue(true as any);
      repository.findById.mockResolvedValue(mockEntity as any);

      const res = await request(app.getHttpServer())
        .delete('/journey-time-configs/config-1');

      if (res.status !== 200 && res.status !== 204) throw new Error('Expected status 200 or 204');
    });
  });
});
