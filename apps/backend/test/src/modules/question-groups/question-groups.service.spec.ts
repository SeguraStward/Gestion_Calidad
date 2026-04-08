import { Test, TestingModule } from '@nestjs/testing';
import { Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { QuestionGroupsService } from '@modules/question-groups/question-groups.service';
import { QuestionGroupsRepository } from '@modules/question-groups/question-groups.repository';
import { DtoValidator } from '@core/common/dto-validator';
import { PrismaService } from '@src/prisma/prisma.service';

describe('QuestionGroupsService (Unitaria)', () => {
  let service: QuestionGroupsService;
  let repository: jest.Mocked<QuestionGroupsRepository>;
  let prisma: jest.Mocked<PrismaService>;

  const mockGroup = {
    id: 'g-1',
    name: 'Grupo 1',
    stepNumber: 1,
    status: 'ACTIVE',
    appliesTo: ['FINAL_REPORT'],
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

  const mockPrismaService = () => ({
    question: {
      count: jest.fn(),
    },
  });

  const mockDtoValidatorFactory = () => ({
    validate: jest.fn().mockImplementation((entity) => entity),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionGroupsService,
        {
          provide: QuestionGroupsRepository,
          useFactory: mockRepository,
        },
        {
          provide: PrismaService,
          useFactory: mockPrismaService,
        },
        {
          provide: DtoValidator,
          useFactory: mockDtoValidatorFactory,
        },
      ],
    }).compile();

    service = module.get<QuestionGroupsService>(QuestionGroupsService);
    repository = module.get(QuestionGroupsRepository);
    prisma = module.get(PrismaService) as any;

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deleteById', () => {
    it('Permite eliminar un grupo si no tiene preguntas activas relacionadas', async () => {
      repository.findById.mockResolvedValue(mockGroup);
      prisma.question.count.mockResolvedValue(0);
      repository.deleteById.mockResolvedValue(true);

      const result = await service.deleteById('g-1');

      expect(result).toBe(true);
      expect(prisma.question.count).toHaveBeenCalledWith({
        where: { groupId: 'g-1', status: 'ACTIVE' }
      });
      expect(repository.deleteById).toHaveBeenCalledWith('g-1');
    });

    it('Lanza error si el grupo de preguntas no existe', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.deleteById('g-unidades')).rejects.toThrow('QuestionGroup with id g-unidades not found');
    });

    it('Lanza un error si hay preguntas activas asociadas al grupo', async () => {
      repository.findById.mockResolvedValue(mockGroup);
      prisma.question.count.mockResolvedValue(2);

      await expect(service.deleteById('g-1')).rejects.toThrowError('Cannot delete QuestionGroup because it has associated: questions.');
    });
  });

  describe('getQuestionGroupsByStep', () => {
    it('Retorna grupos filtrados por paso y tipo de reporte', async () => {
      repository.findAll.mockResolvedValue({ data: [mockGroup as any], meta: { total: 1 } } as any);

      const result = await service.getQuestionGroupsByStep(1, 'FINAL_REPORT');

      expect(repository.findAll).toHaveBeenCalledWith(
        1, 100,
        { stepNumber: 1, status: 'ACTIVE', appliesTo: { has: 'FINAL_REPORT' } },
        { createdAt: 'asc' }
      );
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getQuestionGroupsWithQuestionsByStep', () => {
    it('Debe incluir las preguntas activas vinculadas', async () => {
      repository.findAll.mockResolvedValue({ data: [{ ...mockGroup, questions: [] } as any], meta: { total: 1 } } as any);

      const result = await service.getQuestionGroupsWithQuestionsByStep(1, 'FINAL_REPORT');

      expect(repository.findAll).toHaveBeenCalledWith(
        1, 100,
        { stepNumber: 1, status: 'ACTIVE', appliesTo: { has: 'FINAL_REPORT' } },
        { createdAt: 'asc' },
        { questions: { where: { status: 'ACTIVE' } } }
      );
      expect(result.data).toBeDefined();
    });
  });
});