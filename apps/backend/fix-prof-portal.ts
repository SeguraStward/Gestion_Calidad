import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ProfessorPortalService } from '@src/modules/professor-portal/professor-portal.service';
import { ProjectsRepository } from '@src/modules/projects/projects.repository';
import { AcademicLoadsRepository } from '@src/modules/academic-loads/academic-loads.repository';
import { PrismaService } from '@src/prisma/prisma.service';
import { ProfessorsService } from '@src/modules/professors/professors.service';
import { JwtService } from '@nestjs/jwt';

describe('ProfessorPortalService', () => {
  let service: ProfessorPortalService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      professor: { findFirst: jest.fn() },
      course: { findFirst: jest.fn() },
      academicLoad: { findMany: jest.fn() }
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfessorPortalService,
        { provide: ProjectsRepository, useValue: {} },
        { provide: AcademicLoadsRepository, useValue: {} },
        { provide: PrismaService, useValue: prisma },
        { provide: ProfessorsService, useValue: { getByAuthUserId: jest.fn().mockResolvedValue({ id: 'p1', email: 'a@a.com', identification: '123' }) } },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('tok'), verify: jest.fn().mockReturnValue({sub: '123'}) } },
      ],
    }).compile();

    service = module.get(ProfessorPortalService);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  describe('Methods', () => {
    it('generateToken', async () => {
      prisma.professor.findFirst.mockResolvedValue({ id: '1', identification: '123', email: 'd' });
      const r = await service.generateToken({ identification: '123', validateEmail: false });
      expect(r.token).toBeDefined();
    });

    it('access', async () => {
      prisma.professor.findFirst.mockResolvedValue({ id: '1', identification: '123', email: 'd' });
      const r = await service.access({ identification: '123', code: 'tok' });
      expect(r.success).toBeTruthy();
    });

    it('getMyCourses', async () => {
      prisma.academicLoad.findMany.mockResolvedValue([{ id: 'al' }]);
      const r = await service.getMyCourses('1');
      expect(r.academicLoads).toHaveLength(1);
    });

  });
});
