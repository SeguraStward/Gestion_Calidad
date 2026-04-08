/**
 * Pruebas unitarias — AcademicCyclesService (extiende GenericService)
 *
 * AcademicCyclesService no tiene métodos propios; toda la lógica vive en GenericService.
 * Estos tests verifican que el servicio:
 *  - Delega CRUD al repositorio correctamente
 *  - Aplica relationCheckConfig (academicLoads, projects) en deleteById y softDeleteById
 *  - Lanza BadRequestException al intentar eliminar un ciclo con cargas/proyectos activos
 *  - Lanza NotFoundException si la entidad no existe
 */

import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { AcademicCyclesService } from '@modules/academic-cycles/academic-cycles.service';
import { AcademicCyclesRepository } from '@modules/academic-cycles/academic-cycles.repository';
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

const cicloBase = {
  id: 'ac-1',
  name: 'Ciclo I - 2024',
  academicLoads: [],
  projects: [],
};

// ─── Suite principal ─────────────────────────────────────────────────────────

describe('AcademicCyclesService', () => {
  let service: AcademicCyclesService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(() => {
    repo = mockRepo();
    service = new AcademicCyclesService(
      repo as unknown as AcademicCyclesRepository,
      mockDtoValidator() as unknown as DtoValidator,
    );
    jest.spyOn(service['logger'] as Logger, 'error').mockImplementation(() => {});
    jest.spyOn(service['logger'] as Logger, 'debug').mockImplementation(() => {});
  });

  // ── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('debe retornar lista paginada de ciclos académicos', async () => {
      const pagina = { data: [cicloBase], meta: { page: 1, limit: 10, total: 1 } };
      repo.findAll.mockResolvedValue(pagina);

      const resultado = await service.findAll(1, 10);

      expect(repo.findAll).toHaveBeenCalledWith(1, 10, undefined, undefined, undefined);
      expect(resultado.meta.total).toBe(1);
    });
  });

  // ── findById ───────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('debe retornar el ciclo si existe', async () => {
      repo.findById.mockResolvedValue(cicloBase);
      const resultado = await service.findById('ac-1');
      expect(resultado).toBeDefined();
    });

    it('debe retornar null si el ciclo no existe', async () => {
      repo.findById.mockResolvedValue(null);
      const resultado = await service.findById('no-existe');
      expect(resultado).toBeNull();
    });
  });

  // ── count ──────────────────────────────────────────────────────────────────

  describe('count', () => {
    it('debe retornar el conteo desde el repositorio', async () => {
      repo.count.mockResolvedValue(3);
      const resultado = await service.count({ status: 'ACTIVE' });
      expect(repo.count).toHaveBeenCalledWith({ status: 'ACTIVE' });
      expect(resultado).toBe(3);
    });
  });

  // ── deleteById con relationCheckConfig ────────────────────────────────────

  describe('deleteById', () => {
    it('debe eliminar el ciclo si no tiene cargas ni proyectos activos', async () => {
      repo.findById.mockResolvedValue({ ...cicloBase, academicLoads: [], projects: [] });
      repo.deleteById.mockResolvedValue(true);

      const resultado = await service.deleteById('ac-1');

      expect(repo.deleteById).toHaveBeenCalledWith('ac-1');
      expect(resultado).toBe(true);
    });

    it('debe lanzar BadRequestException si el ciclo tiene cargas académicas activas', async () => {
      repo.findById.mockResolvedValue({
        ...cicloBase,
        academicLoads: [{ id: 'al-1', status: 'ACTIVE' }],
        projects: [],
      });

      await expect(service.deleteById('ac-1')).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si el ciclo tiene proyectos activos', async () => {
      repo.findById.mockResolvedValue({
        ...cicloBase,
        academicLoads: [],
        projects: [{ id: 'p-1', status: 'ACTIVE' }],
      });

      await expect(service.deleteById('ac-1')).rejects.toThrow(BadRequestException);
    });

    it('debe permitir eliminar si academicLoads y projects están todos INACTIVE', async () => {
      repo.findById.mockResolvedValue({
        ...cicloBase,
        academicLoads: [{ id: 'al-1', status: 'INACTIVE' }],
        projects: [{ id: 'p-1', status: 'INACTIVE' }],
      });
      repo.deleteById.mockResolvedValue(true);

      const resultado = await service.deleteById('ac-1');
      expect(resultado).toBe(true);
    });

    it('debe lanzar NotFoundException si el ciclo no existe', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.deleteById('no-existe')).rejects.toThrow(NotFoundException);
    });
  });

  // ── softDeleteById con relationCheckConfig ────────────────────────────────

  describe('softDeleteById', () => {
    it('debe marcar el ciclo como INACTIVE si no tiene relaciones activas', async () => {
      const cicloActualizado = { ...cicloBase, status: 'INACTIVE' };
      repo.findById.mockResolvedValue({ ...cicloBase, academicLoads: [], projects: [] });
      repo.update.mockResolvedValue(cicloActualizado);

      const resultado = await service.softDeleteById('ac-1');

      expect(repo.update).toHaveBeenCalledWith('ac-1', expect.objectContaining({ status: 'INACTIVE' }));
      expect(resultado).toBeDefined();
    });

    it('debe lanzar BadRequestException si tiene cargas académicas activas', async () => {
      repo.findById.mockResolvedValue({
        ...cicloBase,
        academicLoads: [{ id: 'al-1', status: 'ACTIVE' }],
        projects: [],
      });

      await expect(service.softDeleteById('ac-1')).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar NotFoundException si el ciclo no existe', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.softDeleteById('no-existe')).rejects.toThrow(NotFoundException);
    });
  });

  // ── save ───────────────────────────────────────────────────────────────────

  describe('save', () => {
    it('debe guardar y retornar el ciclo creado', async () => {
      const dto = { name: 'Ciclo II - 2024' };
      repo.save.mockResolvedValue(cicloBase);
      const dtoValidator = service['dtoValidator'] as any;
      dtoValidator.validate.mockResolvedValue(cicloBase);

      const resultado = await service.save(dto as any);

      expect(repo.save).toHaveBeenCalledWith(dto);
      expect(resultado).toBeDefined();
    });
  });

  // ── update ─────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('debe actualizar el ciclo y retornar el resultado', async () => {
      const actualizado = { ...cicloBase, name: 'Ciclo I - 2025' };
      repo.update.mockResolvedValue(actualizado);

      const resultado = await service.update('ac-1', { name: 'Ciclo I - 2025' } as any);

      expect(repo.update).toHaveBeenCalledWith('ac-1', expect.objectContaining({ name: 'Ciclo I - 2025' }));
      expect(resultado).toBeDefined();
    });
  });
});
