import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { AcademicLoadsService } from '@src/modules/academic-loads/academic-loads.service';
import { AcademicLoadsRepository } from '@src/modules/academic-loads/academic-loads.repository';
import { DtoValidator } from '@src/core/common/dto-validator';
import { PrismaService } from '@src/prisma/prisma.service';

describe('AcademicLoadsService (Unitaria)', () => {
  let service: AcademicLoadsService;
  let prisma: any;
  let repo: any;

  beforeEach(async () => {
    prisma = {
      academicLoad: {
        findFirst: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      }
    };
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
        AcademicLoadsService,
        { provide: AcademicLoadsRepository, useValue: repo },
        { provide: DtoValidator, useValue: { validate: jest.fn().mockImplementation((res) => res) } },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AcademicLoadsService>(AcademicLoadsService);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  describe('bulkImportAcademicLoads', () => {
    it('debe saltar cargas inválidas', async () => {
      const res = await service.bulkImportAcademicLoads([{} as any]);
      expect(res.errors).toBe(1);
    });

    it('debe actualizar carga existente', async () => {
      prisma.academicLoad.findFirst.mockResolvedValue({ id: 'al1' });
      prisma.academicLoad.update.mockResolvedValue({ id: 'al1' });
      const res = await service.bulkImportAcademicLoads([{
        nrc: '123', nombreEstudiante: 'Est 1', identificacion: '1234', estado: 'A', horasDedicadas: 20
      } as any]);
      expect(res.updated).toBe(1);
    });

    it('debe crear carga si no existe', async () => {
      prisma.academicLoad.findFirst.mockResolvedValue(null);
      prisma.academicLoad.create.mockResolvedValue({ id: 'al1' });
      const res = await service.bulkImportAcademicLoads([{
        nrc: '123', nombreEstudiante: 'Est 1', identificacion: '1234', estado: 'A', horasDedicadas: 20
      } as any]);
      expect(res.created).toBe(1);
    });

    it('debe manejar errores de BD', async () => {
      prisma.academicLoad.findFirst.mockRejectedValue(new Error('err'));
      const res = await service.bulkImportAcademicLoads([{
        nrc: '123', nombreEstudiante: 'Est 1', identificacion: '1234', estado: 'A', horasDedicadas: 20
      } as any]);
      expect(res.errors).toBe(1);
    });
  });

  describe('CRUD Overrides', () => {
    it('save', async () => {
      repo.save.mockResolvedValue({ id: '1' });
      const r = await service.save({ nrc: '123' } as any);
      expect(r.id).toBe('1');
    });

    it('update', async () => {
      repo.update.mockResolvedValue({ id: '1' });
      const r = await service.update('1', { nrc: '123' } as any);
      expect(r.id).toBe('1');
    });

    it('findById', async () => {
      repo.findById.mockResolvedValue({ id: '1' });
      const r = await service.findById('1');
      expect(r.id).toBe('1');
    });

    it('findAll', async () => {
      repo.findAll.mockResolvedValue({ data: [{id: '1'}], meta: {total: 1} });
      const r = await service.findAll(1, 10, { q: '123', campusId: '1', courseId: '1', professorId: '1' }, 'nrc');
      expect(r.data).toHaveLength(1);
    });

    it('findAllByProfessorId', async () => {
      repo.findAll.mockResolvedValue({ data: [{id: '1'}], meta: {total: 1} });
      const r = await service.findAllByProfessorId('prof1');
      expect(r.data).toHaveLength(1);
    });

    it('delete', async () => {
      repo.deleteById.mockResolvedValue({ id: '1' });
      const r = await service.delete('1');
      expect(r).toBeUndefined(); // Or whatever it returns
    });
  });
});
