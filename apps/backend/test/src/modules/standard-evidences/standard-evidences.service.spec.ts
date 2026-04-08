import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { StandardEvidencesService } from '@modules/standard-evidences/standard-evidences.service';
import { StandardEvidencesRepository } from '@modules/standard-evidences/standard-evidences.repository';
import { DtoValidator } from '@core/common/dto-validator';

describe('StandardEvidencesService (Unitaria)', () => {
  let service: StandardEvidencesService;
  let repository: jest.Mocked<StandardEvidencesRepository>;
  let dtoValidator: jest.Mocked<DtoValidator>;

  const mockEvidence = {
    id: 'ev-1',
    standardId: 'std-1',
    documentId: 'doc-1',
    createdAt: new Date(),
    updatedAt: new Date(),
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

  const mockDtoValidatorFactory = () => ({
    validate: jest.fn().mockImplementation((entity) => entity),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StandardEvidencesService,
        {
          provide: StandardEvidencesRepository,
          useFactory: mockRepository,
        },
        {
          provide: DtoValidator,
          useFactory: mockDtoValidatorFactory,
        },
      ],
    }).compile();

    service = module.get<StandardEvidencesService>(StandardEvidencesService);
    repository = module.get(StandardEvidencesRepository);
    dtoValidator = module.get(DtoValidator);

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('save', () => {
    it('Permite subir y enlazar una evidencia con un criterio SINAES válido', async () => {
      const createDto = {
        standardId: 'std-1',
        documentId: 'doc-1',
      };

      repository.save.mockResolvedValue(mockEvidence as any);

      const result = await service.save(createDto as any);

      expect(repository.save).toHaveBeenCalledWith(createDto);
      expect(result).toBeDefined();
      expect(result.id).toEqual(mockEvidence.id);
    });
  });
});