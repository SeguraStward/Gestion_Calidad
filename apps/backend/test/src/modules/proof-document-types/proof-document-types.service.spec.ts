/**
 * Pruebas unitarias — ProofDocumentTypesService
 *
 * Cubre:
 *  - deleteById → tipo no existe, tipo sin documentos, con docs inactivos, con docs activos (BadRequest)
 *  - Herencia GenericService → save, update, findById, findAll
 */

import { BadRequestException, Logger } from '@nestjs/common';
import { ProofDocumentTypesService } from '@modules/proof-document-types/proof-document-types.service';
import { ProofDocumentTypesRepository } from '@modules/proof-document-types/proof-document-types.repository';
import { DtoValidator } from '@core/common/dto-validator';

const mockRepo = () => ({
  save: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  deleteById: jest.fn(),
  softDeleteById: jest.fn(),
  findOne: jest.fn(),
  count: jest.fn(),
});

const mockDtoValidator = () => ({
  validate: jest.fn().mockImplementation(async (e) => e),
});

const tipoBase = {
  id: 'type-1',
  name: 'Acta',
  status: 'ACTIVE',
  proofDocuments: [],
};

describe('ProofDocumentTypesService', () => {
  let service: ProofDocumentTypesService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(() => {
    repo = mockRepo();
    service = new ProofDocumentTypesService(
      repo as unknown as ProofDocumentTypesRepository,
      mockDtoValidator() as unknown as DtoValidator,
    );
    jest.spyOn(service['logger'] as Logger, 'log').mockImplementation(() => {});
    jest.spyOn(service['logger'] as Logger, 'warn').mockImplementation(() => {});
    jest.spyOn(service['logger'] as Logger, 'error').mockImplementation(() => {});
    jest.spyOn(service['logger'] as Logger, 'debug').mockImplementation(() => {});
  });

  // ── deleteById ────────────────────────────────────────────────────────────

  describe('deleteById', () => {
    it('debe lanzar NotFoundException si el tipo no existe en BD', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.deleteById('type-no-existe')).rejects.toThrow('type-no-existe');
      expect(repo.findById).toHaveBeenCalledWith('type-no-existe', { proofDocuments: true });
    });

    it('debe eliminar tipo sin documentos asociados', async () => {
      repo.findById.mockResolvedValue({ ...tipoBase, proofDocuments: [] });
      repo.deleteById.mockResolvedValue(true);
      const result = await service.deleteById('type-1');
      expect(repo.deleteById).toHaveBeenCalledWith('type-1');
      expect(result).toBe(true);
    });

    it('debe eliminar tipo con documentos inactivos', async () => {
      repo.findById.mockResolvedValue({
        ...tipoBase,
        proofDocuments: [
          { id: 'doc-1', name: 'Acta vieja', status: 'INACTIVE' },
        ],
      });
      repo.deleteById.mockResolvedValue(true);
      const result = await service.deleteById('type-1');
      expect(result).toBe(true);
    });

    it('debe lanzar BadRequestException si tiene documentos activos', async () => {
      repo.findById.mockResolvedValue({
        ...tipoBase,
        proofDocuments: [
          { id: 'doc-1', name: 'Acta activa', status: 'ACTIVE' },
        ],
      });
      // super.deleteById chequea relationCheckConfig
      repo.count.mockResolvedValue(1); // simula relación activa

      await expect(service.deleteById('type-1')).rejects.toThrow(BadRequestException);
    });

    it('debe propagar errores inesperados', async () => {
      repo.findById.mockRejectedValue(new Error('DB connection error'));
      await expect(service.deleteById('type-1')).rejects.toThrow('DB connection error');
    });
  });

  // ── save (heredado de GenericService) ────────────────────────────────────

  describe('save', () => {
    it('debe crear un tipo de documento', async () => {
      repo.save.mockResolvedValue(tipoBase);
      const result = await service.save({ name: 'Acta' } as any);
      expect(repo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  // ── update (heredado) ─────────────────────────────────────────────────────

  describe('update', () => {
    it('debe actualizar el tipo', async () => {
      repo.update.mockResolvedValue({ ...tipoBase, name: 'Acta Actualizada' });
      const result = await service.update('type-1', { name: 'Acta Actualizada' } as any);
      expect(repo.update).toHaveBeenCalledWith('type-1', expect.objectContaining({ name: 'Acta Actualizada' }));
    });
  });

  // ── findById (heredado) ───────────────────────────────────────────────────

  describe('findById', () => {
    it('debe retornar el tipo por id', async () => {
      repo.findById.mockResolvedValue(tipoBase);
      const result = await service.findById('type-1');
      expect(result).toBeDefined();
    });

    it('debe retornar null si no existe', async () => {
      repo.findById.mockResolvedValue(null);
      const result = await service.findById('no-existe');
      expect(result).toBeNull();
    });
  });

  // ── findAll (heredado) ────────────────────────────────────────────────────

  describe('findAll', () => {
    it('debe retornar lista paginada', async () => {
      repo.findAll.mockResolvedValue({ data: [tipoBase], meta: { total: 1, page: 1, limit: 10 } });
      const result = await service.findAll(1, 10);
      expect(result.data).toHaveLength(1);
    });
  });
});
