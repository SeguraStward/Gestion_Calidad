import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { AcademicLoadGroupsService } from '@modules/academic-load-groups/academic-load-groups.service';
import { AcademicLoadGroupsRepository } from '@modules/academic-load-groups/academic-load-groups.repository';
import { DtoValidator } from '@core/common/dto-validator';

describe('AcademicLoadGroupsService (Unitaria)', () => {
  let service: AcademicLoadGroupsService;
  let repository: jest.Mocked<AcademicLoadGroupsRepository>;

  const mockEntity = {
    id: 'group-1',
    name: 'Test AcademicLoadGroups',
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
        AcademicLoadGroupsService,
        { provide: AcademicLoadGroupsRepository, useFactory: mockRepository },
        { provide: DtoValidator, useFactory: mockDtoValidator },
      ],
    }).compile();

    service = module.get<AcademicLoadGroupsService>(AcademicLoadGroupsService);
    repository = module.get(AcademicLoadGroupsRepository);

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
