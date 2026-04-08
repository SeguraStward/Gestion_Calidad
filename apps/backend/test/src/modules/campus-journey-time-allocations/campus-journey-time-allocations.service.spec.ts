import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { CampusJourneyTimeAllocationsService } from '@modules/campus-journey-time-allocations/campus-journey-time-allocations.service';
import { CampusJourneyTimeAllocationsRepository } from '@modules/campus-journey-time-allocations/campus-journey-time-allocations.repository';
import { DtoValidator } from '@core/common/dto-validator';
import { PrismaService } from '@src/prisma/prisma.service';

describe('CampusJourneyTimeAllocationsService (Unitaria)', () => {
  let service: CampusJourneyTimeAllocationsService;
  let repository: jest.Mocked<CampusJourneyTimeAllocationsRepository>;

  const mockEntity = {
    id: 'campus-alloc-1',
    name: 'Test CampusJourneyTimeAllocations',
    status: 'ACTIVE',
  };

  const mockRepository = () => ({
    findAll: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    deleteById: jest.fn(),
    count: jest.fn(),
  });

  const mockDtoValidator = () => ({
    validate: jest.fn().mockImplementation((payload, cls) => payload),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampusJourneyTimeAllocationsService,
        { provide: CampusJourneyTimeAllocationsRepository, useFactory: mockRepository },
        { provide: DtoValidator, useFactory: mockDtoValidator },
        { provide: PrismaService, useValue: { campusJourneyTimeAllocation: { findMany: jest.fn().mockResolvedValue([mockEntity]) } } },
      ],
    }).compile();

    service = module.get<CampusJourneyTimeAllocationsService>(CampusJourneyTimeAllocationsService);
    repository = module.get(CampusJourneyTimeAllocationsRepository);

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('Debe consultar todos los registros', async () => {
      repository.findAll.mockResolvedValue({ data: [mockEntity as any], meta: { total: 1 } } as any);
      const result = await service.findAll(1, 10, {});
      // expect(repository.findAll).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
    });
  });
});
