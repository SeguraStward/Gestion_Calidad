import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard, PermissionsGuard } from '@src/modules/auth/guards';
import { AuditFieldsGuard } from '@src/core/http/guards';
import { PrismaService } from '@src/prisma/prisma.service';
import { CampusJourneyTimeAllocationsService } from '@modules/campus-journey-time-allocations/campus-journey-time-allocations.service';
import { DtoValidator } from '@core/common/dto-validator';

import { CampusJourneyTimeAllocationsModule } from '@modules/campus-journey-time-allocations/campus-journey-time-allocations.module';
import { CampusJourneyTimeAllocationsRepository } from '@modules/campus-journey-time-allocations/campus-journey-time-allocations.repository';

describe('CampusJourneyTimeAllocationsModule (Modular)', () => {
  let app: INestApplication;
  let repository: jest.Mocked<CampusJourneyTimeAllocationsRepository>;
  let service: jest.Mocked<CampusJourneyTimeAllocationsService>;

  const mockEntity = {
    annualAllocationId: 'annual-alloc-1',
    cycleId: 'cycle-1',
    campusId: 'campus-1',
    allocatedJourneyTime: 200,
    id: 'campus-alloc-1',
    name: 'Test CampusJourneyTimeAllocations',
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
    validate: jest.fn().mockImplementation((payload, cls) => payload),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CampusJourneyTimeAllocationsModule],
    })
      .overrideProvider(CampusJourneyTimeAllocationsRepository).useValue(mockRepository)
      .overrideProvider(CampusJourneyTimeAllocationsService).useValue({ save: jest.fn(), findAll: jest.fn(), findById: jest.fn(), update: jest.fn(), deleteById: jest.fn() })
      .overrideProvider(DtoValidator).useValue(mockDtoValidator)
      .overrideProvider(PrismaService).useValue({ annualJourneyTimeAllocation: { findUnique: jest.fn().mockResolvedValue({ id: 'annual-alloc-1', availableJourneyTime: 1000 }) }, campusJourneyTimeAllocation: { findMany: jest.fn().mockResolvedValue([mockEntity]) } })
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

    repository = moduleFixture.get<CampusJourneyTimeAllocationsRepository>(CampusJourneyTimeAllocationsRepository) as any;
    service = moduleFixture.get<CampusJourneyTimeAllocationsService>(CampusJourneyTimeAllocationsService) as any;
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Flujos HTTP - CampusJourneyTimeAllocations', () => {
    it('POST /campus-journey-time-allocations — Crea registro — responde 201', async () => {
      const createDto = {
        annualAllocationId: 'annual-alloc-1',
        cycleId: 'cycle-1',
        campusId: 'campus-1',
        allocatedJourneyTime: 200,
        baseJourneyTimeConsumed: 0,
        additionalTime: 0,
        status: 'DRAFT',
      };
      service.save.mockResolvedValue(mockEntity as any);
      service.findById.mockResolvedValue(mockEntity as any);

      const response = await request(app.getHttpServer())
        .post('/campus-journey-time-allocations')
        .send(createDto);
        
      if (response.status !== 201) console.log(response.body);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(service.save).toHaveBeenCalled();
    });

    it('GET /campus-journey-time-allocations — Lista registros — responde 200', async () => {
      service.findAll.mockResolvedValue({ data: [mockEntity as any], meta: { total: 1 } } as any);

      const response = await request(app.getHttpServer())
        .get('/campus-journey-time-allocations?page=1&limit=10')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
    });

    it('GET /campus-journey-time-allocations/:id — Obtiene un registro — responde 200', async () => {
      service.findById.mockResolvedValue(mockEntity as any);

      const response = await request(app.getHttpServer())
        .get('/campus-journey-time-allocations/campus-alloc-1')
        .expect(200);

      expect(response.body.id).toBe('campus-alloc-1');
    });

    it('PUT /campus-journey-time-allocations/:id — Actualiza registro — responde 204 o 200', async () => {
      const updateDto = { name: 'Updated' };
      repository.update.mockResolvedValue({ ...mockEntity, ...updateDto } as any);

      const res = await request(app.getHttpServer())
        .put('/campus-journey-time-allocations/campus-alloc-1')
        .send(updateDto);

      if (res.status !== 200 && res.status !== 204) throw new Error('Expected status 200 or 204, got ' + res.status);
    });

    it('DELETE /campus-journey-time-allocations/:id — Elimina registro — responde 200 o 204', async () => {
      repository.deleteById.mockResolvedValue(true);
      service.findById.mockResolvedValue(mockEntity as any);

      const res = await request(app.getHttpServer())
        .delete('/campus-journey-time-allocations/campus-alloc-1');

      if (res.status !== 200 && res.status !== 204) throw new Error('Expected status 200 or 204');
    });
  });
});
