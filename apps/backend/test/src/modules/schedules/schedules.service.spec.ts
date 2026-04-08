import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { SchedulesService } from '@modules/schedules/schedules.service';
import { SchedulesRepository } from '@modules/schedules/schedules.repository';
import { DtoValidator } from '@core/common/dto-validator';

describe('SchedulesService (Unitaria)', () => {
  let service: SchedulesService;
  let repository: jest.Mocked<SchedulesRepository>;

  const mockEntity = {
    id: 'schedule-1',
    name: 'Test Schedules',
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
        SchedulesService,
        { provide: SchedulesRepository, useFactory: mockRepository },
        { provide: DtoValidator, useFactory: mockDtoValidator },
      ],
    }).compile();

    service = module.get<SchedulesService>(SchedulesService);
    repository = module.get(SchedulesRepository);

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
