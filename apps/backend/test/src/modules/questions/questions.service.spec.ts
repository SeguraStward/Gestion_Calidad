import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { QuestionsService } from '@modules/questions/questions.service';
import { QuestionsRepository } from '@modules/questions/questions.repository';
import { DtoValidator } from '@core/common/dto-validator';

describe('QuestionsService (Unitaria)', () => {
  let service: QuestionsService;
  let repository: jest.Mocked<QuestionsRepository>;

  const mockQuestion = {
    id: 'q-1',
    text: '¿Cuál es el objetivo principal?',
    stepNumber: 1,
    groupId: 'g-1',
    status: 'ACTIVE',
    appliesTo: ['FINAL_REPORT'],
    group: {
      id: 'g-1',
      name: 'Grupo 1'
    }
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
        QuestionsService,
        {
          provide: QuestionsRepository,
          useFactory: mockRepository,
        },
        {
          provide: DtoValidator,
          useFactory: mockDtoValidatorFactory,
        },
      ],
    }).compile();

    service = module.get<QuestionsService>(QuestionsService);
    repository = module.get(QuestionsRepository);

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getQuestionsByStep', () => {
    it('Debe consultar preguntas según paso y opcionalmente tipo de reporte', async () => {
      repository.findAll.mockResolvedValue({ data: [mockQuestion as any], meta: { total: 1 } } as any);

      const result = await service.getQuestionsByStep(1, 'FINAL_REPORT');

      expect(repository.findAll).toHaveBeenCalledWith(
        1, 100,
        { stepNumber: 1, status: 'ACTIVE', appliesTo: { has: 'FINAL_REPORT' } },
        { createdAt: 'asc' },
        { group: true }
      );
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getQuestionsGroupedByStep', () => {
    it('Debe agrupar preguntas por nombre de grupo', async () => {
      repository.findAll.mockResolvedValue({ data: [mockQuestion as any], meta: { total: 1 } } as any);

      const result = await service.getQuestionsGroupedByStep(1);

      expect(result['Grupo 1']).toBeDefined();
      expect(result['Grupo 1'].questions).toHaveLength(1);
    });
  });

  describe('getQuestionsByStepAndGroup', () => {
    it('Debe consultar indicando paso y grupo', async () => {
      repository.findAll.mockResolvedValue({ data: [mockQuestion as any], meta: { total: 1 } } as any);

      const result = await service.getQuestionsByStepAndGroup(1, 'g-1', 'FINAL_REPORT');

      expect(repository.findAll).toHaveBeenCalledWith(
        1, 100,
        { stepNumber: 1, groupId: 'g-1', status: 'ACTIVE', appliesTo: { has: 'FINAL_REPORT' } },
        { createdAt: 'asc' },
        { group: true }
      );
      expect(result.data).toHaveLength(1);
    });
  });
});
