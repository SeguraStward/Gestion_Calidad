/**
 * Pruebas unitarias — StandardsService (extiende GenericService)
 *
 * Lógica propia:
 *  - save   → valida nombre único antes de crear (ConflictException si ya existe)
 *  - update → valida nombre único excluyendo el id actual
 *
 * Heredado de GenericService:
 *  - deleteById / softDeleteById con relationCheckConfig (evidences, standardEvidences)
 */

import { BadRequestException, ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { StandardsService } from '@modules/standards/standards.service';
import { StandardsRepository } from '@modules/standards/standards.repository';
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
  existsByName: jest.fn(),
});

const mockDtoValidator = () => ({
  validate: jest.fn().mockImplementation(async (entity) => entity),
});

// ─── Datos de prueba ─────────────────────────────────────────────────────────

const standardBase = {
  id: 'std-1',
  name: 'Estándar A',
  evidences: [],
  standardEvidences: [],
};

// ─── Suite principal ─────────────────────────────────────────────────────────

describe('StandardsService', () => {
  let service: StandardsService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(() => {
    repo = mockRepo();
    service = new StandardsService(
      repo as unknown as StandardsRepository,
      mockDtoValidator() as unknown as DtoValidator,
    );
    jest.spyOn(service['logger'] as Logger, 'error').mockImplementation(() => {});
    jest.spyOn(service['logger'] as Logger, 'debug').mockImplementation(() => {});
  });

  // ── save con validación de nombre único ───────────────────────────────────

  describe('save', () => {
    it('debe crear el estándar si el nombre no existe', async () => {
      repo.existsByName.mockResolvedValue(false);
      repo.save.mockResolvedValue(standardBase);
      const dtoValidator = service['dtoValidator'] as any;
      dtoValidator.validate.mockResolvedValue(standardBase);

      const dto = { name: 'Estándar A' } as any;
      const resultado = await service.save(dto);

      expect(repo.existsByName).toHaveBeenCalledWith('Estándar A');
      expect(repo.save).toHaveBeenCalledWith(dto);
      expect(resultado).toBeDefined();
    });

    it('debe lanzar ConflictException si el nombre ya existe', async () => {
      repo.existsByName.mockResolvedValue(true);

      await expect(service.save({ name: 'Estándar A' } as any)).rejects.toThrow(ConflictException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('el mensaje de ConflictException debe incluir el nombre del estándar', async () => {
      repo.existsByName.mockResolvedValue(true);

      await expect(service.save({ name: 'Duplicado' } as any)).rejects.toThrow(
        /Duplicado/,
      );
    });
  });

  // ── update con validación de nombre único ─────────────────────────────────

  describe('update', () => {
    it('debe actualizar si el nombre no está en uso por otro estándar', async () => {
      repo.existsByName.mockResolvedValue(false);
      repo.update.mockResolvedValue({ ...standardBase, name: 'Estándar B' });

      const resultado = await service.update('std-1', { name: 'Estándar B' } as any);

      expect(repo.existsByName).toHaveBeenCalledWith('Estándar B', 'std-1');
      expect(repo.update).toHaveBeenCalled();
      expect(resultado).toBeDefined();
    });

    it('debe lanzar ConflictException si otro estándar ya usa ese nombre', async () => {
      repo.existsByName.mockResolvedValue(true);

      await expect(service.update('std-1', { name: 'Nombre Duplicado' } as any)).rejects.toThrow(
        ConflictException,
      );
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('debe omitir la validación de nombre si el DTO no incluye name', async () => {
      repo.update.mockResolvedValue(standardBase);

      await service.update('std-1', { description: 'Nueva descripción' } as any);

      expect(repo.existsByName).not.toHaveBeenCalled();
      expect(repo.update).toHaveBeenCalled();
    });
  });

  // ── deleteById con relationCheckConfig ────────────────────────────────────

  describe('deleteById', () => {
    it('debe eliminar el estándar si no tiene evidencias activas', async () => {
      repo.findById.mockResolvedValue({ ...standardBase, evidences: [], standardEvidences: [] });
      repo.deleteById.mockResolvedValue(true);

      const resultado = await service.deleteById('std-1');

      expect(repo.deleteById).toHaveBeenCalledWith('std-1');
      expect(resultado).toBe(true);
    });

    it('debe lanzar BadRequestException si tiene evidences activas', async () => {
      repo.findById.mockResolvedValue({
        ...standardBase,
        evidences: [{ id: 'ev-1', status: 'ACTIVE' }],
        standardEvidences: [],
      });

      await expect(service.deleteById('std-1')).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si tiene standardEvidences activas', async () => {
      repo.findById.mockResolvedValue({
        ...standardBase,
        evidences: [],
        standardEvidences: [{ id: 'se-1', status: 'ACTIVE' }],
      });

      await expect(service.deleteById('std-1')).rejects.toThrow(BadRequestException);
    });

    it('debe permitir eliminar si todas las evidencias están INACTIVE', async () => {
      repo.findById.mockResolvedValue({
        ...standardBase,
        evidences: [{ id: 'ev-1', status: 'INACTIVE' }],
        standardEvidences: [{ id: 'se-1', status: 'INACTIVE' }],
      });
      repo.deleteById.mockResolvedValue(true);

      const resultado = await service.deleteById('std-1');
      expect(resultado).toBe(true);
    });

    it('debe lanzar NotFoundException si el estándar no existe', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.deleteById('no-existe')).rejects.toThrow(NotFoundException);
    });
  });

  // ── softDeleteById con relationCheckConfig ────────────────────────────────

  describe('softDeleteById', () => {
    it('debe marcar el estándar como INACTIVE si no tiene evidencias activas', async () => {
      repo.findById.mockResolvedValue({ ...standardBase, evidences: [], standardEvidences: [] });
      repo.update.mockResolvedValue({ ...standardBase, status: 'INACTIVE' });

      const resultado = await service.softDeleteById('std-1');

      expect(repo.update).toHaveBeenCalledWith('std-1', expect.objectContaining({ status: 'INACTIVE' }));
      expect(resultado).toBeDefined();
    });

    it('debe lanzar BadRequestException si tiene evidencias activas', async () => {
      repo.findById.mockResolvedValue({
        ...standardBase,
        evidences: [{ id: 'ev-1', status: 'ACTIVE' }],
        standardEvidences: [],
      });

      await expect(service.softDeleteById('std-1')).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar NotFoundException si el estándar no existe', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.softDeleteById('no-existe')).rejects.toThrow(NotFoundException);
    });
  });

  // ── findAll / count ───────────────────────────────────────────────────────

  describe('findAll', () => {
    it('debe retornar lista paginada de estándares', async () => {
      const pagina = { data: [standardBase], meta: { page: 1, limit: 10, total: 1 } };
      repo.findAll.mockResolvedValue(pagina);

      const resultado = await service.findAll(1, 10);

      expect(resultado.meta.total).toBe(1);
    });
  });

  describe('count', () => {
    it('debe retornar el conteo desde el repositorio', async () => {
      repo.count.mockResolvedValue(8);
      const resultado = await service.count();
      expect(resultado).toBe(8);
    });
  });
});
