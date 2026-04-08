import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { CoursesService } from '@src/modules/courses/courses.service';
import { CoursesRepository } from '@src/modules/courses/courses.repository';
import { DtoValidator } from '@src/core/common/dto-validator';
import { PrismaService } from '@src/prisma/prisma.service';

describe('CoursesService (Unitaria)', () => {
  let service: CoursesService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      course: {
        findFirst: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      }
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: CoursesRepository, useValue: {} },
        { provide: DtoValidator, useValue: {} },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  describe('bulkImportCourses', () => {
    it('debe saltar cursos inválidos', async () => {
      const res = await service.bulkImportCourses([{} as any]);
      expect(res.errors).toBe(1);
    });

    it('debe actualizar curso existente', async () => {
      prisma.course.findFirst.mockResolvedValue({ id: 'c1' });
      prisma.course.update.mockResolvedValue({ id: 'c1' });
      const res = await service.bulkImportCourses([{
        codigo: 'C1', nombre: 'Curso 1', creditos: 3, nivel: 1, horasContacto: 2
      }]);
      expect(res.updated).toBe(1);
    });

    it('debe crear curso si no existe', async () => {
      prisma.course.findFirst.mockResolvedValue(null);
      prisma.course.create.mockResolvedValue({ id: 'c1' });
      const res = await service.bulkImportCourses([{
        codigo: 'C1', nombre: 'Curso 1', creditos: 3, nivel: 1, horasContacto: 2
      }]);
      expect(res.created).toBe(1);
    });

    it('debe manejar errores de BD', async () => {
      prisma.course.findFirst.mockRejectedValue(new Error('err'));
      const res = await service.bulkImportCourses([{
        codigo: 'C1', nombre: 'Curso 1', creditos: 3, nivel: 1, horasContacto: 2
      }]);
      expect(res.errors).toBe(1);
    });
  });
});
