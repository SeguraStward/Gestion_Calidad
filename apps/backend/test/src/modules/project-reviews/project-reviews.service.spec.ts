import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ProjectReviewsService } from '@src/modules/project-reviews/project-reviews.service';
import { ProjectReviewsRepository } from '@src/modules/project-reviews/project-reviews.repository';
import { DtoValidator } from '@src/core/common/dto-validator';

describe('ProjectReviewsService', () => {
  let service: ProjectReviewsService;
  let repo: any;

  beforeEach(async () => {
    repo = {
        save: jest.fn(),
        update: jest.fn(),
        findById: jest.fn(),
        findAll: jest.fn(),
        deleteById: jest.fn(),
        findOne: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectReviewsService,
        { provide: ProjectReviewsRepository, useValue: repo },
        { provide: DtoValidator, useValue: { validate: jest.fn().mockImplementation((res) => res) } },
      ],
    }).compile();

    service = module.get(ProjectReviewsService);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  describe('Methods', () => {
    it('findAll', async () => {
      repo.findAll.mockResolvedValue({ data: [{id: '1'}], meta: {total: 1} });
      const r = await service.findAll(1, 10, { q: '123' }, 'id', 'asc');
      expect(r.data).toHaveLength(1);
    });
  });
});
