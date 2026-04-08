/**
 * Pruebas unitarias — CommissionsService (extiende GenericService)
 *
 * CommissionsService no tiene métodos propios.
 * El foco está en el relationCheckConfig con 4 relaciones:
 *   projects, reviews, sessions, members
 *
 * Verifica deleteById y softDeleteById para cada relación activa/inactiva.
 */

import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { CommissionsService } from '@modules/commissions/commissions.service';
import { CommissionsRepository } from '@modules/commissions/commissions.repository';
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

const comisionBase = {
  id: 'com-1',
  name: 'Comisión de Acreditación',
  projects: [],
  reviews: [],
  sessions: [],
  members: [],
};

// ─── Suite principal ─────────────────────────────────────────────────────────

describe('CommissionsService', () => {
  let service: CommissionsService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(() => {
    repo = mockRepo();
    service = new CommissionsService(
      repo as unknown as CommissionsRepository,
      mockDtoValidator() as unknown as DtoValidator,
    );
    jest.spyOn(service['logger'] as Logger, 'error').mockImplementation(() => {});
    jest.spyOn(service['logger'] as Logger, 'debug').mockImplementation(() => {});
  });

  // ── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('debe retornar lista paginada de comisiones', async () => {
      const pagina = { data: [comisionBase], meta: { page: 1, limit: 10, total: 1 } };
      repo.findAll.mockResolvedValue(pagina);

      const resultado = await service.findAll(1, 10);

      expect(repo.findAll).toHaveBeenCalledWith(1, 10, undefined, undefined, undefined);
      expect(resultado.meta.total).toBe(1);
    });
  });

  // ── deleteById — cada relación activa bloquea la eliminación ──────────────

  describe('deleteById', () => {
    it('debe eliminar la comisión si no tiene ninguna relación activa', async () => {
      repo.findById.mockResolvedValue({ ...comisionBase });
      repo.deleteById.mockResolvedValue(true);

      const resultado = await service.deleteById('com-1');

      expect(repo.deleteById).toHaveBeenCalledWith('com-1');
      expect(resultado).toBe(true);
    });

    it('debe lanzar BadRequestException si tiene projects activos', async () => {
      repo.findById.mockResolvedValue({
        ...comisionBase,
        projects: [{ id: 'p-1', status: 'ACTIVE' }],
      });

      await expect(service.deleteById('com-1')).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si tiene reviews activos', async () => {
      repo.findById.mockResolvedValue({
        ...comisionBase,
        reviews: [{ id: 'r-1', status: 'ACTIVE' }],
      });

      await expect(service.deleteById('com-1')).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si tiene sessions activas', async () => {
      repo.findById.mockResolvedValue({
        ...comisionBase,
        sessions: [{ id: 's-1', status: 'ACTIVE' }],
      });

      await expect(service.deleteById('com-1')).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si tiene members activos', async () => {
      repo.findById.mockResolvedValue({
        ...comisionBase,
        members: [{ id: 'm-1', status: 'ACTIVE' }],
      });

      await expect(service.deleteById('com-1')).rejects.toThrow(BadRequestException);
    });

    it('debe permitir eliminar si todas las relaciones están INACTIVE', async () => {
      repo.findById.mockResolvedValue({
        ...comisionBase,
        projects: [{ id: 'p-1', status: 'INACTIVE' }],
        reviews: [{ id: 'r-1', status: 'INACTIVE' }],
        sessions: [{ id: 's-1', status: 'INACTIVE' }],
        members: [{ id: 'm-1', status: 'INACTIVE' }],
      });
      repo.deleteById.mockResolvedValue(true);

      const resultado = await service.deleteById('com-1');
      expect(resultado).toBe(true);
    });

    it('debe lanzar NotFoundException si la comisión no existe', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.deleteById('no-existe')).rejects.toThrow(NotFoundException);
    });
  });

  // ── softDeleteById — misma lógica de relaciones ───────────────────────────

  describe('softDeleteById', () => {
    it('debe marcar la comisión como INACTIVE si no tiene relaciones activas', async () => {
      repo.findById.mockResolvedValue({ ...comisionBase });
      repo.update.mockResolvedValue({ ...comisionBase, status: 'INACTIVE' });

      const resultado = await service.softDeleteById('com-1');

      expect(repo.update).toHaveBeenCalledWith('com-1', expect.objectContaining({ status: 'INACTIVE' }));
      expect(resultado).toBeDefined();
    });

    it('debe lanzar BadRequestException si tiene members activos', async () => {
      repo.findById.mockResolvedValue({
        ...comisionBase,
        members: [{ id: 'm-1', status: 'ACTIVE' }],
      });

      await expect(service.softDeleteById('com-1')).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar NotFoundException si la comisión no existe', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.softDeleteById('no-existe')).rejects.toThrow(NotFoundException);
    });
  });

  // ── save / update / count ─────────────────────────────────────────────────

  describe('save', () => {
    it('debe crear y retornar la comisión', async () => {
      const dto = { name: 'Nueva Comisión' };
      repo.save.mockResolvedValue(comisionBase);
      const dtoValidator = service['dtoValidator'] as any;
      dtoValidator.validate.mockResolvedValue(comisionBase);

      const resultado = await service.save(dto as any);

      expect(repo.save).toHaveBeenCalledWith(dto);
      expect(resultado).toBeDefined();
    });
  });

  describe('update', () => {
    it('debe actualizar la comisión y retornar el resultado', async () => {
      const actualizada = { ...comisionBase, name: 'Comisión Actualizada' };
      repo.update.mockResolvedValue(actualizada);

      const resultado = await service.update('com-1', { name: 'Comisión Actualizada' } as any);

      expect(repo.update).toHaveBeenCalledWith('com-1', expect.objectContaining({ name: 'Comisión Actualizada' }));
      expect(resultado).toBeDefined();
    });
  });

  describe('count', () => {
    it('debe retornar el conteo desde el repositorio', async () => {
      repo.count.mockResolvedValue(4);
      const resultado = await service.count();
      expect(resultado).toBe(4);
    });
  });
});
