import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { AnnualJourneyTimeAllocationsService } from '@src/modules/annual-journey-time-allocations/annual-journey-time-allocations.service';
import { AnnualJourneyTimeAllocationsRepository } from '@src/modules/annual-journey-time-allocations/annual-journey-time-allocations.repository';
import { DtoValidator } from '@src/core/common/dto-validator';
import { PrismaService } from '@src/prisma/prisma.service';
import { HttpException } from '@nestjs/common';

describe('AnnualJourneyTimeAllocationsService', () => {
  let service: AnnualJourneyTimeAllocationsService;
  let repo: any;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      project: { findFirst: jest.fn() },
      course: { findFirst: jest.fn() },
    };
    repo = {
        save: jest.fn(),
        update: jest.fn(),
        findById: jest.fn(),
        findAll: jest.fn(),
        deleteById: jest.fn(),
        findOne: jest.fn(),
        findByProfessorAndYear: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnnualJourneyTimeAllocationsService,
        { provide: AnnualJourneyTimeAllocationsRepository, useValue: repo },
        { provide: DtoValidator, useValue: { validate: jest.fn().mockImplementation((res) => res) } },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(AnnualJourneyTimeAllocationsService);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  describe('CRUD Overrides', () => {
    it('findAll', async () => {
      repo.findAll.mockResolvedValue({ data: [{id: '1'}], meta: {total: 1} });
      const r = await service.findAll(1, 10, { professorId: '1', "year": 2024 });
      expect(r.data).toHaveLength(1);
    });

    it('getActive', async () => {
      repo.findAll.mockResolvedValue({ data: [{id: '1'}], meta: {total: 1} });
      const r = await service.getActive();
      expect(r.data).toHaveLength(1);
    });

    it('getYearSummary', async () => {
      repo.findByProfessorAndYear.mockResolvedValue([{ id: '1', academicWorkHours: 10 }]);
      const r = await service.getYearSummary('prof1', 2024);
      expect(r).toBeDefined();
    });

    it('save', async () => {
      repo.save.mockResolvedValue({ id: '1' });
      const r = await service.save({ year: 2024 } as any);
      expect(r.id).toBe('1');
    });

    it('update', async () => {
      repo.update.mockResolvedValue({ id: '1' });
      const r = await service.update('1', { year: 2024 } as any);
      expect(r.id).toBe('1');
    });
  });
});
