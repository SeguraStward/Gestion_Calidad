import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { TimesService } from '@modules/times/times.service';
import { TimesRepository } from '@modules/times/times.repository';
import { DtoValidator } from '@core/common/dto-validator';

describe('TimesService (Unitaria)', () => {
  let service: TimesService;
  let repository: jest.Mocked<TimesRepository>;

  const mockEntity = {
    id: 'time-1',
    name: 'Test Times',
    status: 'ACTIVE',
  };

  const mockRepository = () => ({
    getMockCampusAllocations: jest.fn(),
    create: jest.fn(),
  });

  const mockDtoValidator = () => ({
    validate: jest.fn().mockImplementation((payload, cls) => payload),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimesService,
        { provide: TimesRepository, useFactory: mockRepository },
        { provide: DtoValidator, useFactory: mockDtoValidator },
      ],
    }).compile();

    service = module.get<TimesService>(TimesService);
    repository = module.get(TimesRepository);

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMockCampusAllocations', () => {
    it('Debe consultar todos los registros', async () => {
      const result = await service.getMockCampusAllocations();
      expect(result).toHaveLength(2);
    });
  });
});
