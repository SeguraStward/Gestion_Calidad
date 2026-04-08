import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ClassroomsService } from '@modules/classrooms/classrooms.service';
import { ClassroomsRepository } from '@modules/classrooms/classrooms.repository';
import { DtoValidator } from '@core/common/dto-validator';

describe('ClassroomsService (Unitaria)', () => {
  let service: ClassroomsService;
  let repository: jest.Mocked<ClassroomsRepository>;

  const mockEntity = {
    id: 'classroom-1',
    name: 'Test Classrooms',
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
        ClassroomsService,
        { provide: ClassroomsRepository, useFactory: mockRepository },
        { provide: DtoValidator, useFactory: mockDtoValidator },
      ],
    }).compile();

    service = module.get<ClassroomsService>(ClassroomsService);
    repository = module.get(ClassroomsRepository);

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
