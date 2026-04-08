import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { CampusesService } from '@modules/campuses/campuses.service';
import { CampusesRepository } from '@modules/campuses/campuses.repository';
import { DtoValidator } from '@core/common/dto-validator';

describe('CampusesService (Unitaria)', () => {
  let service: CampusesService;
  let repository: jest.Mocked<CampusesRepository>;

  const mockEntity = {
    id: 'campus-1',
    name: 'Test Campuses',
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
        CampusesService,
        { provide: CampusesRepository, useFactory: mockRepository },
        { provide: DtoValidator, useFactory: mockDtoValidator },
      ],
    }).compile();

    service = module.get<CampusesService>(CampusesService);
    repository = module.get(CampusesRepository);

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
