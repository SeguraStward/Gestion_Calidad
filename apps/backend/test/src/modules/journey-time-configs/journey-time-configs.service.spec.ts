import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { JourneyTimeConfigsService } from '@modules/journey-time-configs/journey-time-configs.service';
import { JourneyTimeConfigsRepository } from '@modules/journey-time-configs/journey-time-configs.repository';
import { DtoValidator } from '@core/common/dto-validator';

describe('JourneyTimeConfigsService (Unitaria)', () => {
  let service: JourneyTimeConfigsService;
  let repository: jest.Mocked<JourneyTimeConfigsRepository>;

  const mockEntity = {
    id: 'config-1',
    name: 'Test JourneyTimeConfigs',
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
        JourneyTimeConfigsService,
        { provide: JourneyTimeConfigsRepository, useFactory: mockRepository },
        { provide: DtoValidator, useFactory: mockDtoValidator },
      ],
    }).compile();

    service = module.get<JourneyTimeConfigsService>(JourneyTimeConfigsService);
    repository = module.get(JourneyTimeConfigsRepository);

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
