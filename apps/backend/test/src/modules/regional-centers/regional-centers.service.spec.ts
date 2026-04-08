import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { RegionalCentersService } from '@modules/regional-centers/regional-centers.service';
import { RegionalCentersRepository } from '@modules/regional-centers/regional-centers.repository';
import { DtoValidator } from '@core/common/dto-validator';

describe('RegionalCentersService (Unitaria)', () => {
  let service: RegionalCentersService;
  let repository: jest.Mocked<RegionalCentersRepository>;

  const mockEntity = {
    id: 'regional-center-1',
    name: 'Test RegionalCenters',
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
    validate: jest.fn().mockImplementation((entity) => entity),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegionalCentersService,
        { provide: RegionalCentersRepository, useFactory: mockRepository },
        { provide: DtoValidator, useFactory: mockDtoValidator },
      ],
    }).compile();

    service = module.get<RegionalCentersService>(RegionalCentersService);
    repository = module.get(RegionalCentersRepository);

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
      expect(repository.findAll).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
    });
  });
});
