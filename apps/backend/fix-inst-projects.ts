import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { InstitutionalProjectsService } from '@src/modules/institutional-projects/institutional-projects.service';
import { InstitutionalProjectsRepository } from '@src/modules/institutional-projects/institutional-projects.repository';
import { DtoValidator } from '@src/core/common/dto-validator';
import { PrismaService } from '@src/prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('InstitutionalProjectsService', () => {
  let service: InstitutionalProjectsService;
  let repo: any;
  let prisma: any;
  let cache: any;

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
        findByCampusAllocation: jest.fn(),
        findByDirector: jest.fn(),
        calculateTotalAssignedTime: jest.fn(),
        findWithAvailableTime: jest.fn(),
    };
    cache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstitutionalProjectsService,
        { provide: InstitutionalProjectsRepository, useValue: repo },
        { provide: DtoValidator, useValue: { validate: jest.fn().mockImplementation((res) => res) } },
        { provide: PrismaService, useValue: prisma },
        { provide: CACHE_MANAGER, useValue: cache },
      ],
    }).compile();

    service = module.get(InstitutionalProjectsService);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  describe('Overrides', () => {
    it('create', async () => {
      repo.save.mockResolvedValue({ id: '1' });
      const r = await service.create({ name: 'p' } as any);
      expect(r.id).toBe('1');
    });

    it('findAll', async () => {
      repo.findAll.mockResolvedValue({ data: [{id: '1'}], meta: {total: 1} });
      const r = await service.findAll(1, 10, { query: 'p' }, 'id', 'asc');
      expect(r.data).toHaveLength(1);
    });

    it('findById', async () => {
      repo.findById.mockResolvedValue({ id: '1' });
      const r = await service.findById('1');
      expect(r.id).toBe('1');
    });

    it('update', async () => {
      repo.update.mockResolvedValue({ id: '1' });
      const r = await service.update('1', { name: 'p2' } as any);
      expect(r.id).toBe('1');
    });

    it('delete', async () => {
      repo.deleteById.mockResolvedValue(true);
      await service.delete('1');
      expect(repo.deleteById).toHaveBeenCalled();
    });

    it('findByCampusAllocation', async () => {
      repo.findByCampusAllocation.mockResolvedValue([{ id: '1' }]);
      const r = await service.findByCampusAllocation('c1');
      expect(r).toBeDefined();
    });

    it('findByDirector', async () => {
      repo.findByDirector.mockResolvedValue([{ id: '1' }]);
      const r = await service.findByDirector('d1');
      expect(r).toBeDefined();
    });

    it('calculateTotalAssignedTime', async () => {
      repo.calculateTotalAssignedTime.mockResolvedValue(10);
      const r = await service.calculateTotalAssignedTime('1');
      expect(r).toBe(10);
    });

    it('findWithAvailableTime', async () => {
      repo.findWithAvailableTime.mockResolvedValue([{ id: '1' }]);
      const r = await service.findWithAvailableTime('c1');
      expect(r).toBeDefined();
    });
  });
});
