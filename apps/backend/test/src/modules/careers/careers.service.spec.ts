/**
 * Pruebas unitarias — CareersService (extiende GenericService)
 *
 * CareersService no tiene métodos propios; toda la lógica vive en GenericService.
 * Estos tests verifican que el servicio:
 *  - Delega CRUD al repositorio correctamente
 *  - Aplica relationCheckConfig (courses, projects) en deleteById y softDeleteById
 *  - Lanza BadRequestException al intentar eliminar una carrera con cursos/proyectos activos
 *  - Lanza NotFoundException si la entidad no existe
 */

import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { CareersService } from '@modules/careers/careers.service';
import { CareersRepository } from '@modules/careers/careers.repository';
import { DtoValidator } from '@core/common/dto-validator';

// ─── Mock del repositorio ────────────────────────────────────────────────────

const mockRepo = () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  deleteById: jest.fn(),
  count: jest.fn(),
  softDeleteById: jest.fn(),
});

const mockDtoValidator = () => ({
  validate: jest.fn().mockImplementation(async (entity) => entity),
});

// ─── Datos de prueba ─────────────────────────────────────────────────────────

const carreraBase = {
  id: 'car-1',
  name: 'Ingeniería en Sistemas',
  courses: [],
  projects: [],
};

// ─── Suite principal ─────────────────────────────────────────────────────────

describe('CareersService', () => {
  let service: CareersService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(() => {
    repo = mockRepo();
    service = new CareersService(
      repo as unknown as CareersRepository,
      mockDtoValidator() as unknown as DtoValidator,
    );
    // Silenciar logs del servicio en los tests
    jest.spyOn(service['logger'] as Logger, 'error').mockImplementation(() => {});
    jest.spyOn(service['logger'] as Logger, 'debug').mockImplementation(() => {});
  });

  // ── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('debe retornar lista paginada de carreras', async () => {
      const pagina = { data: [carreraBase], meta: { page: 1, limit: 10, total: 1 } };
      repo.findAll.mockResolvedValue(pagina);

      const resultado = await service.findAll(1, 10);

      expect(repo.findAll).toHaveBeenCalledWith(1, 10, undefined, undefined, undefined);
      expect(resultado.meta).toEqual(pagina.meta);
    });
  });

  // ── findById ───────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('debe retornar la carrera si existe', async () => {
      repo.findById.mockResolvedValue(carreraBase);
      const resultado = await service.findById('car-1');
      expect(resultado).toBeDefined();
    });

    it('debe retornar null si la carrera no existe', async () => {
      repo.findById.mockResolvedValue(null);
      const resultado = await service.findById('no-existe');
      expect(resultado).toBeNull();
    });
  });

  // ── count ──────────────────────────────────────────────────────────────────

  describe('count', () => {
    it('debe retornar el conteo desde el repositorio', async () => {
      repo.count.mockResolvedValue(5);
      const resultado = await service.count();
      expect(resultado).toBe(5);
    });
  });

  // ── deleteById con relationCheckConfig ────────────────────────────────────

  describe('deleteById', () => {
    it('debe eliminar la carrera si no tiene cursos ni proyectos activos', async () => {
      repo.findById.mockResolvedValue({ ...carreraBase, courses: [], projects: [] });
      repo.deleteById.mockResolvedValue(true);

      const resultado = await service.deleteById('car-1');

      expect(repo.deleteById).toHaveBeenCalledWith('car-1');
      expect(resultado).toBe(true);
    });

    it('debe lanzar BadRequestException si la carrera tiene cursos activos', async () => {
      repo.findById.mockResolvedValue({
        ...carreraBase,
        courses: [{ id: 'curso-1', status: 'ACTIVE' }],
        projects: [],
      });

      await expect(service.deleteById('car-1')).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si la carrera tiene proyectos activos', async () => {
      repo.findById.mockResolvedValue({
        ...carreraBase,
        courses: [],
        projects: [{ id: 'proj-1', status: 'ACTIVE' }],
      });

      await expect(service.deleteById('car-1')).rejects.toThrow(BadRequestException);
    });

    it('debe permitir eliminar si los cursos/proyectos están INACTIVE', async () => {
      repo.findById.mockResolvedValue({
        ...carreraBase,
        courses: [{ id: 'curso-1', status: 'INACTIVE' }],
        projects: [{ id: 'proj-1', status: 'INACTIVE' }],
      });
      repo.deleteById.mockResolvedValue(true);

      const resultado = await service.deleteById('car-1');
      expect(resultado).toBe(true);
    });

    it('debe lanzar NotFoundException si la carrera no existe', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.deleteById('no-existe')).rejects.toThrow(NotFoundException);
    });
  });

  // ── softDeleteById con relationCheckConfig ────────────────────────────────

  describe('softDeleteById', () => {
    it('debe marcar la carrera como INACTIVE si no tiene relaciones activas', async () => {
      const carreraActualizada = { ...carreraBase, status: 'INACTIVE' };
      repo.findById.mockResolvedValue({ ...carreraBase, courses: [], projects: [] });
      repo.update.mockResolvedValue(carreraActualizada);

      const resultado = await service.softDeleteById('car-1');

      expect(repo.update).toHaveBeenCalledWith('car-1', expect.objectContaining({ status: 'INACTIVE' }));
      expect(resultado).toBeDefined();
    });

    it('debe lanzar BadRequestException si tiene cursos activos', async () => {
      repo.findById.mockResolvedValue({
        ...carreraBase,
        courses: [{ id: 'c1', status: 'ACTIVE' }],
        projects: [],
      });

      await expect(service.softDeleteById('car-1')).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar NotFoundException si la carrera no existe', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.softDeleteById('no-existe')).rejects.toThrow(NotFoundException);
    });
  });
});
