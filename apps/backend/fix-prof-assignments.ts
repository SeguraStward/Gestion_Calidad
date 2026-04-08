import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ProfessorAssignmentsService } from '@src/modules/professor-assignments/professor-assignments.service';
import { ProfessorAssignmentsRepository } from '@src/modules/professor-assignments/professor-assignments.repository';
import { DtoValidator } from '@src/core/common/dto-validator';
import { PrismaService } from '@src/prisma/prisma.service';

describe('ProfessorAssignmentsService', () => {
  let service: ProfessorAssignmentsService;
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
        checkOverlaps: jest.fn(),
        validateAllocationLimits: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfessorAssignmentsService,
        { provide: ProfessorAssignmentsRepository, useValue: repo },
        { provide: DtoValidator, useValue: { validate: jest.fn().mockImplementation((res) => res) } },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(ProfessorAssignmentsService);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  describe('Overrides', () => {
    it('findAll', async () => {
      repo.findAll.mockResolvedValue({ data: [{id: '1'}], meta: {total: 1} });
      const r = await service.findAll(1, 10, { professorId: 'p' }, 'id', 'asc');
      expect(r.data).toHaveLength(1);
    });

    it('save - success', async () => {
      repo.checkOverlaps.mockResolvedValue([]);
      repo.validateAllocationLimits.mockResolvedValue({ valid: true });
      repo.save.mockResolvedValue({ id: '1' });
      const r = await service.save({ year: 2024, type: 'COURSE' } as any);
      expect(r.id).toBe('1');
    });

    it('save - overlaps', async () => {
      repo.checkOverlaps.mockResolvedValue([{ id: '2' }]);
      await expect(service.save({ year: 2024, type: 'COURSE' } as any)).rejects.toThrow();
    });

    it('save - allocation limit', async () => {
      repo.checkOverlaps.mockResolvedValue([]);
      repo.validateAllocationLimits.mockResolvedValue({ valid: false, error: 'limit' });
      await expect(service.save({ year: 2024, type: 'COURSE' } as any)).rejects.toThrow();
    });

  });
});
