/**
 * Pruebas unitarias — CohortsService
 *
 * Cubre:
 *  - create          → delega a repo.save con defaults
 *  - findAll         → delega a repo.findAllWithCareer
 *  - findByCareer    → delega a repo.findByCareer
 *  - findById        → delega a repo.findById
 *  - update          → delega a repo.update
 *  - delete          → delega a repo.deleteById
 */

import { NotFoundException } from '@nestjs/common';
import { CohortsService } from '@modules/cohorts/cohorts.service';
import { CohortsRepository } from '@modules/cohorts/cohorts.repository';

// ─── Mock del repositorio ────────────────────────────────────────────────────

const mockRepo = () => ({
  save: jest.fn(),
  findAllWithCareer: jest.fn(),
  findByCareer: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  deleteById: jest.fn(),
});

// ─── Datos de prueba ─────────────────────────────────────────────────────────

const cohorteBase = {
  id: 'c1',
  careerId: 'career-1',
  year: 2024,
  group: 'A',
  initialStudents: 30,
  status: 'ACTIVE',
};

// ─── Suite principal ─────────────────────────────────────────────────────────

describe('CohortsService', () => {
  let service: CohortsService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(() => {
    repo = mockRepo();
    service = new CohortsService(repo as unknown as CohortsRepository);
  });

  // ── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('debe guardar la cohorte con los campos del DTO', async () => {
      repo.save.mockResolvedValue(cohorteBase);

      const dto = { careerId: 'career-1', year: 2024, group: 'A', initialStudents: 30, status: 'ACTIVE' as any };
      const resultado = await service.create(dto);

      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          careerId: 'career-1',
          year: 2024,
          group: 'A',
          initialStudents: 30,
          status: 'ACTIVE',
        }),
      );
      expect(resultado).toEqual(cohorteBase);
    });

    it('debe usar status ACTIVE por defecto si no se proporciona', async () => {
      repo.save.mockResolvedValue({ ...cohorteBase, status: 'ACTIVE' });

      const dto = { careerId: 'career-1', year: 2024, group: 'B', initialStudents: 25 } as any;
      await service.create(dto);

      const { status } = repo.save.mock.calls[0][0];
      expect(status).toBe('ACTIVE');
    });

    it('debe respetar el status si se proporciona en el DTO', async () => {
      repo.save.mockResolvedValue({ ...cohorteBase, status: 'INACTIVE' });

      const dto = { careerId: 'career-1', year: 2023, group: 'C', initialStudents: 20, status: 'INACTIVE' as any };
      await service.create(dto);

      const { status } = repo.save.mock.calls[0][0];
      expect(status).toBe('INACTIVE');
    });
  });

  // ── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('debe retornar todas las cohortes con su carrera', async () => {
      const lista = [cohorteBase, { ...cohorteBase, id: 'c2', group: 'B' }];
      repo.findAllWithCareer.mockResolvedValue(lista);

      const resultado = await service.findAll();

      expect(repo.findAllWithCareer).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(lista);
    });

    it('debe retornar arreglo vacío si no hay cohortes', async () => {
      repo.findAllWithCareer.mockResolvedValue([]);
      const resultado = await service.findAll();
      expect(resultado).toEqual([]);
    });
  });

  // ── findByCareer ───────────────────────────────────────────────────────────

  describe('findByCareer', () => {
    it('debe retornar las cohortes filtradas por careerId', async () => {
      const lista = [cohorteBase];
      repo.findByCareer.mockResolvedValue(lista);

      const resultado = await service.findByCareer('career-1');

      expect(repo.findByCareer).toHaveBeenCalledWith('career-1');
      expect(resultado).toEqual(lista);
    });

    it('debe retornar arreglo vacío si la carrera no tiene cohortes', async () => {
      repo.findByCareer.mockResolvedValue([]);
      const resultado = await service.findByCareer('career-sin-cohortes');
      expect(resultado).toEqual([]);
    });
  });

  // ── findById ───────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('debe retornar la cohorte por id', async () => {
      repo.findById.mockResolvedValue(cohorteBase);

      const resultado = await service.findById('c1');

      expect(repo.findById).toHaveBeenCalledWith('c1');
      expect(resultado).toEqual(cohorteBase);
    });

    it('debe lanzar NotFoundException si la cohorte no existe', async () => {
      repo.findById.mockResolvedValue(null);
      try {
        await service.findById('no-existe');
        fail('Debió lanzar NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  // ── update ─────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('debe actualizar la cohorte y retornar el resultado', async () => {
      const actualizada = { ...cohorteBase, initialStudents: 35 };
      repo.update.mockResolvedValue(actualizada);

      const dto = { initialStudents: 35 } as any;
      const resultado = await service.update('c1', dto);

      expect(repo.update).toHaveBeenCalledWith('c1', dto);
      expect(resultado).toEqual(actualizada);
    });
  });

  // ── delete ─────────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('debe eliminar la cohorte y retornar true', async () => {
      repo.deleteById.mockResolvedValue(true);

      const resultado = await service.delete('c1');

      expect(repo.deleteById).toHaveBeenCalledWith('c1');
      expect(resultado).toBe(true);
    });
  });
});
