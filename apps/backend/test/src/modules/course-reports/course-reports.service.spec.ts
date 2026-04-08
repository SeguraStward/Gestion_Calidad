import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { CourseReportsService } from '@modules/course-reports/course-reports.service';
import { CourseReportsRepository } from '@modules/course-reports/course-reports.repository';
import { DtoValidator } from '@core/common/dto-validator';
import { PrismaService } from '@src/prisma/prisma.service';

describe('CourseReportsService (Unitaria)', () => {
  let service: CourseReportsService;
  let repository: jest.Mocked<CourseReportsRepository>;

  const mockEntity = {
    id: 'course-report-1',
    name: 'Test CourseReports',
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
    findByCampus: jest.fn(),
    findForProjection: jest.fn(),
  });

  const mockPrisma = () => ({
    academicCycle: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    }
  });

  const mockDtoValidator = () => ({
    validate: jest.fn().mockImplementation((payload, cls) => payload),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseReportsService,
        { provide: CourseReportsRepository, useFactory: mockRepository },
        { provide: DtoValidator, useFactory: mockDtoValidator },
        { provide: PrismaService, useFactory: mockPrisma },
      ],
    }).compile();

    service = module.get<CourseReportsService>(CourseReportsService);
    repository = module.get(CourseReportsRepository);

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
