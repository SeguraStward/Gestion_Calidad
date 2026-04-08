/**
 * Pruebas unitarias — ProjectsService (extiende GenericService)
 *
 * ProjectsService no tiene métodos propios.
 * El foco está en el relationCheckConfig con 2 relaciones:
 *   documents, reviews
 *
 * Verifica deleteById y softDeleteById para cada relación activa/inactiva,
 * además de las operaciones CRUD heredadas de GenericService.
 */

import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { ProjectsService } from '@modules/projects/projects.service';
import { ProjectsRepository } from '@modules/projects/projects.repository';
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
});

const mockDtoValidator = () => ({
  validate: jest.fn().mockImplementation(async (entity) => entity),
});

// ─── Datos de prueba ─────────────────────────────────────────────────────────

const proyectoBase = {
  id: 'proj-1',
  name: 'Proyecto de Acreditación 2024',
  documents: [],
  reviews: [],
};

// ─── Suite principal ─────────────────────────────────────────────────────────

describe('ProjectsService', () => {
  let service: ProjectsService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(() => {
    repo = mockRepo();
    service = new ProjectsService(
      repo as unknown as ProjectsRepository,
      mockDtoValidator() as unknown as DtoValidator,
    );
    jest.spyOn(service['logger'] as Logger, 'error').mockImplementation(() => {});
    jest.spyOn(service['logger'] as Logger, 'debug').mockImplementation(() => {});
  });

  // ── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('debe retornar lista paginada de proyectos', async () => {
      const pagina = { data: [proyectoBase], meta: { page: 1, limit: 10, total: 1 } };
      repo.findAll.mockResolvedValue(pagina);

      const resultado = await service.findAll(1, 10);

      expect(repo.findAll).toHaveBeenCalledWith(1, 10, undefined, undefined, undefined);
      expect(resultado.meta.total).toBe(1);
    });

    it('debe pasar filtros y orderBy al repositorio', async () => {
      const pagina = { data: [], meta: { page: 1, limit: 5, total: 0 } };
      repo.findAll.mockResolvedValue(pagina);

      await service.findAll(1, 5, { status: 'ACTIVE' }, { name: 'asc' });

      expect(repo.findAll).toHaveBeenCalledWith(1, 5, { status: 'ACTIVE' }, { name: 'asc' }, undefined);
    });
  });

  // ── findById ───────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('debe retornar el proyecto si existe', async () => {
      repo.findById.mockResolvedValue(proyectoBase);
      const resultado = await service.findById('proj-1');
      expect(resultado).toBeDefined();
    });

    it('debe retornar null si el proyecto no existe', async () => {
      repo.findById.mockResolvedValue(null);
      const resultado = await service.findById('no-existe');
      expect(resultado).toBeNull();
    });
  });

  // ── count ──────────────────────────────────────────────────────────────────

  describe('count', () => {
    it('debe retornar el conteo desde el repositorio', async () => {
      repo.count.mockResolvedValue(12);
      const resultado = await service.count({ status: 'ACTIVE' });
      expect(repo.count).toHaveBeenCalledWith({ status: 'ACTIVE' });
      expect(resultado).toBe(12);
    });
  });

  // ── save ───────────────────────────────────────────────────────────────────

  describe('save', () => {
    it('debe crear y retornar el proyecto', async () => {
      const dto = { name: 'Nuevo Proyecto' };
      repo.save.mockResolvedValue(proyectoBase);
      const dtoValidator = service['dtoValidator'] as any;
      dtoValidator.validate.mockResolvedValue(proyectoBase);

      const resultado = await service.save(dto as any);

      expect(repo.save).toHaveBeenCalledWith(dto);
      expect(resultado).toBeDefined();
    });
  });

  // ── update ─────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('debe actualizar el proyecto y retornar el resultado', async () => {
      const actualizado = { ...proyectoBase, name: 'Proyecto Actualizado' };
      repo.update.mockResolvedValue(actualizado);

      const resultado = await service.update('proj-1', { name: 'Proyecto Actualizado' } as any);

      expect(repo.update).toHaveBeenCalledWith('proj-1', expect.objectContaining({ name: 'Proyecto Actualizado' }));
      expect(resultado).toBeDefined();
    });
  });

  // ── deleteById con relationCheckConfig ────────────────────────────────────

  describe('deleteById', () => {
    it('debe eliminar el proyecto si no tiene documentos ni reviews activos', async () => {
      repo.findById.mockResolvedValue({ ...proyectoBase, documents: [], reviews: [] });
      repo.deleteById.mockResolvedValue(true);

      const resultado = await service.deleteById('proj-1');

      expect(repo.deleteById).toHaveBeenCalledWith('proj-1');
      expect(resultado).toBe(true);
    });

    it('debe lanzar BadRequestException si tiene documents activos', async () => {
      repo.findById.mockResolvedValue({
        ...proyectoBase,
        documents: [{ id: 'doc-1', status: 'ACTIVE' }],
        reviews: [],
      });

      await expect(service.deleteById('proj-1')).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si tiene reviews activos', async () => {
      repo.findById.mockResolvedValue({
        ...proyectoBase,
        documents: [],
        reviews: [{ id: 'rev-1', status: 'ACTIVE' }],
      });

      await expect(service.deleteById('proj-1')).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si tiene ambas relaciones activas', async () => {
      repo.findById.mockResolvedValue({
        ...proyectoBase,
        documents: [{ id: 'doc-1', status: 'ACTIVE' }],
        reviews: [{ id: 'rev-1', status: 'ACTIVE' }],
      });

      await expect(service.deleteById('proj-1')).rejects.toThrow(BadRequestException);
    });

    it('debe permitir eliminar si documents y reviews están todos INACTIVE', async () => {
      repo.findById.mockResolvedValue({
        ...proyectoBase,
        documents: [{ id: 'doc-1', status: 'INACTIVE' }],
        reviews: [{ id: 'rev-1', status: 'INACTIVE' }],
      });
      repo.deleteById.mockResolvedValue(true);

      const resultado = await service.deleteById('proj-1');
      expect(resultado).toBe(true);
    });

    it('debe lanzar NotFoundException si el proyecto no existe', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.deleteById('no-existe')).rejects.toThrow(NotFoundException);
    });
  });

  // ── softDeleteById con relationCheckConfig ────────────────────────────────

  describe('softDeleteById', () => {
    it('debe marcar el proyecto como INACTIVE si no tiene relaciones activas', async () => {
      repo.findById.mockResolvedValue({ ...proyectoBase, documents: [], reviews: [] });
      repo.update.mockResolvedValue({ ...proyectoBase, status: 'INACTIVE' });

      const resultado = await service.softDeleteById('proj-1');

      expect(repo.update).toHaveBeenCalledWith('proj-1', expect.objectContaining({ status: 'INACTIVE' }));
      expect(resultado).toBeDefined();
    });

    it('debe lanzar BadRequestException si tiene documents activos', async () => {
      repo.findById.mockResolvedValue({
        ...proyectoBase,
        documents: [{ id: 'doc-1', status: 'ACTIVE' }],
        reviews: [],
      });

      await expect(service.softDeleteById('proj-1')).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si tiene reviews activos', async () => {
      repo.findById.mockResolvedValue({
        ...proyectoBase,
        documents: [],
        reviews: [{ id: 'rev-1', status: 'ACTIVE' }],
      });

      await expect(service.softDeleteById('proj-1')).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar NotFoundException si el proyecto no existe', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.softDeleteById('no-existe')).rejects.toThrow(NotFoundException);
    });
  });
});
