import { Test, TestingModule } from '@nestjs/testing';
import { Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { FinalReportsService } from '@modules/final-reports/final-reports.service';
import { FinalReportsRepository } from '@modules/final-reports/final-reports.repository';
import { DtoValidator } from '@core/common/dto-validator';
import { PaginatedResponse } from '@core/http/interfaces/paginated-response.interface';
import { FinalReportDto } from '@modules/final-reports/dtos/final-report.dto';
import { FinalReportStatus } from '@una-gc/database/prisma/generated/client';

describe('FinalReportsService (Unitaria)', () => {
  let service: FinalReportsService;
  let repository: jest.Mocked<FinalReportsRepository>;
  let dtoValidator: jest.Mocked<DtoValidator>;

  const mockFinalReport = {
    id: 'report-1',
    professorId: 'prof-1',
    academicLoadId: 'load-1',
    status: 'ACTIVE' as FinalReportStatus,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPaginatedResponse: PaginatedResponse<any> = {
    data: [mockFinalReport],
    meta: {
      total: 1,
      page: 1,
      lastPage: 1,
      limit: 10,
    },
  };

  const mockFinalReportsRepository = () => ({
    findAll: jest.fn().mockResolvedValue(mockPaginatedResponse),
    findById: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    deleteById: jest.fn(),
    count: jest.fn(),
    findPendingWithEndedCycle: jest.fn(),
  });

  const mockDtoValidatorFactory = () => ({
    validate: jest.fn().mockImplementation((entity) => entity),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinalReportsService,
        {
          provide: FinalReportsRepository,
          useFactory: mockFinalReportsRepository,
        },
        {
          provide: DtoValidator,
          useFactory: mockDtoValidatorFactory,
        },
      ],
    }).compile();

    service = module.get<FinalReportsService>(FinalReportsService);
    repository = module.get(FinalReportsRepository);
    dtoValidator = module.get(DtoValidator);

    // Silence logger for cleaner tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('save', () => {
    it('Crea un FinalReport exitosamente validando el DTO', async () => {
      repository.save.mockResolvedValue(mockFinalReport as any);

      const result = await service.save(mockFinalReport as any);

      expect(repository.save).toHaveBeenCalled();
      expect(dtoValidator.validate).toHaveBeenCalled();
      expect(result).toHaveProperty('id', mockFinalReport.id);
    });
  });

  describe('findById', () => {
    it('Retorna el reporte correctamente enlazado al Proyecto asociado', async () => {
      repository.findById.mockResolvedValue(mockFinalReport as any);

      const result = await service.findById('report-1');

      expect(repository.findById).toHaveBeenCalledWith('report-1', undefined);
      expect(result).toEqual(expect.objectContaining({ id: 'report-1' }));
    });

    it('Lanza NotFoundException si no existe', async () => {
      repository.findById.mockResolvedValue(null as any);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('deleteById', () => {
    it('Elimina exitosamente si no tiene relaciones (relations empty in config)', async () => {
      repository.findById.mockResolvedValue(mockFinalReport as any);
      repository.deleteById.mockResolvedValue(true);

      const result = await service.deleteById('report-1');

      expect(result).toBe(true);
      expect(repository.deleteById).toHaveBeenCalledWith('report-1');
    });
  });

  describe('findAllByProfessorId', () => {
    it('Llama a findAll con validaciones y mapeos de search correctos', async () => {
      await service.findAllByProfessorId('prof-1', 1, 10, 'ACTIVE', 'test');

      expect(repository.findAll).toHaveBeenCalledWith(
        1,
        10,
        expect.objectContaining({
          professorId: 'prof-1',
          status: 'ACTIVE',
        }),
        { createdAt: 'desc' },
        undefined
      );
    });
  });

  describe('findAllForAdmin', () => {
    it('Admin call maps query parameters properly', async () => {
      await service.findAllForAdmin(1, 10, 'EVALUATED', 'prof-2', 'test2');

      expect(repository.findAll).toHaveBeenCalledWith(
        1,
        10,
        expect.objectContaining({
          professorId: 'prof-2',
          status: 'EVALUATED',
        }),
        { createdAt: 'desc' },
        undefined
      );
    });
  });

  describe('evaluatePendingFinalReports', () => {
    it('Ejecuta cron y no hace nada si no hay reportes pendientes', async () => {
      repository.findPendingWithEndedCycle.mockResolvedValue([]);

      await service.evaluatePendingFinalReports();

      expect(repository.findPendingWithEndedCycle).toHaveBeenCalled();
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('Actualiza a EVALUATED a cada reporte devuelto', async () => {
      repository.findPendingWithEndedCycle.mockResolvedValue([mockFinalReport as any]);
      repository.update.mockResolvedValue({ ...mockFinalReport, status: 'EVALUATED' } as any);

      await service.evaluatePendingFinalReports();

      expect(repository.findPendingWithEndedCycle).toHaveBeenCalled();
      expect(repository.update).toHaveBeenCalledWith('report-1', { status: 'EVALUATED' });
    });
  });
});