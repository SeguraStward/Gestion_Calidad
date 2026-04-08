import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard, PermissionsGuard } from '@src/modules/auth/guards';
import { AuditFieldsGuard } from '@src/core/http/guards';
import { PrismaService } from '@src/prisma/prisma.service';
import { AnnualJourneyTimeAllocationsService } from '@modules/annual-journey-time-allocations/annual-journey-time-allocations.service';
import { DtoValidator } from '@core/common/dto-validator';

import { AnnualJourneyTimeAllocationsModule } from '@modules/annual-journey-time-allocations/annual-journey-time-allocations.module';
import { AnnualJourneyTimeAllocationsRepository } from '@modules/annual-journey-time-allocations/annual-journey-time-allocations.repository';

describe('AnnualJourneyTimeAllocationsModule (Modular)', () => {
  let app: INestApplication;
  let repository: jest.Mocked<AnnualJourneyTimeAllocationsRepository>;
  let service: jest.Mocked<AnnualJourneyTimeAllocationsService>;

  const mockEntity = {
    year: 2025,
    totalJourneyTime: 100,
    id: 'alloc-1',
    name: 'Test AnnualJourneyTimeAllocations',
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
      imports: [AnnualJourneyTimeAllocationsModule],
    })
      .overrideProvider(AnnualJourneyTimeAllocationsRepository).useValue(mockRepository)
      // .overrideProvider(AnnualJourneyTimeAllocationsService).useValue({ save: jest.fn(), findAll: jest.fn(), findById: jest.fn(), update: jest.fn(), deleteById: jest.fn() })
      .overrideProvider(DtoValidator).useValue(mockDtoValidator)
      .overrideProvider(PrismaService).useValue({ annualJourneyTimeAllocation: { findMany: jest.fn().mockResolvedValue([mockEntity]) } })
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

    repository = moduleFixture.get<AnnualJourneyTimeAllocationsRepository>(AnnualJourneyTimeAllocationsRepository) as any;
    service = moduleFixture.get<AnnualJourneyTimeAllocationsService>(AnnualJourneyTimeAllocationsService) as any;
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Flujos HTTP - AnnualJourneyTimeAllocations', () => {
    it('POST /annual-journey-time-allocations — Crea registro — responde 201', async () => {
      const createDto = {
        year: 2025,
        totalJourneyTime: 100,
        status: 'DRAFT',
      };
      repository.save.mockResolvedValue(mockEntity as any);
      repository.findById.mockResolvedValue(mockEntity as any);

      const response = await request(app.getHttpServer())
        .post('/annual-journey-time-allocations')
        .send(createDto);
        
      if (response.status !== 201) console.log(response.body);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('year');
      expect(repository.save).toHaveBeenCalled();
    });

    it('GET /annual-journey-time-allocations — Lista registros — responde 200', async () => {
      repository.findAll.mockResolvedValue({ data: [mockEntity as any], meta: { total: 1 } } as any);

      const response = await request(app.getHttpServer())
        .get('/annual-journey-time-allocations?page=1&limit=10')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
    });

    it('GET /annual-journey-time-allocations/:id — Obtiene un registro — responde 200', async () => {
      repository.findById.mockResolvedValue(mockEntity as any);

      const response = await request(app.getHttpServer())
        .get('/annual-journey-time-allocations/alloc-1')
        .expect(200);

      expect(response.body.year).toBe(2025);
    });

    it('PUT /annual-journey-time-allocations/:id — Actualiza registro — responde 204 o 200', async () => {
      const updateDto = { name: 'Updated' };
      repository.update.mockResolvedValue({ ...mockEntity, ...updateDto } as any);

      const res = await request(app.getHttpServer())
        .put('/annual-journey-time-allocations/alloc-1')
        .send(updateDto);

      if (res.status !== 200 && res.status !== 204) throw new Error('Expected status 200 or 204, got ' + res.status);
    });

    it('DELETE /annual-journey-time-allocations/:id — Elimina registro — responde 200 o 204', async () => {
      repository.deleteById.mockResolvedValue(true);
      repository.findById.mockResolvedValue(mockEntity as any);

      const res = await request(app.getHttpServer())
        .delete('/annual-journey-time-allocations/alloc-1');

      if (res.status !== 200 && res.status !== 204) throw new Error('Expected status 200 or 204');
    });
  });
});
