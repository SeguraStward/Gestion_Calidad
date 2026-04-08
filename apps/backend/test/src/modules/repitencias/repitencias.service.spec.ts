/**
 * Pruebas unitarias — RepitenciasService
 * Cubre todos los métodos del servicio.
 */

import { Logger } from '@nestjs/common';
import { RepitenciasService } from '@modules/repitencias/repitencias.service';
import { RepitenciasRepository } from '@modules/repitencias/repitencias.repository';

const mockRepo = () => ({
  save: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  deleteById: jest.fn(),
  findByCampus: jest.fn(),
  findByCourse: jest.fn(),
  findByAcademicCycle: jest.fn(),
  findByCampusAllocation: jest.fn(),
  calculateTotalAdditionalHours: jest.fn(),
  getStatistics: jest.fn(),
});

const repitencia = { id: 'r1', courseCode: 'EIF-101', status: 'ACTIVE' };

describe('RepitenciasService', () => {
  let service: RepitenciasService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(() => {
    repo = mockRepo();
    service = new RepitenciasService(repo as unknown as RepitenciasRepository);
    jest.spyOn(service['logger'] as Logger, 'log').mockImplementation(() => {});
    jest.spyOn(service['logger'] as Logger, 'error').mockImplementation(() => {});
  });

  // ── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('debe delegar al repositorio y retornar la entidad creada', async () => {
      repo.save.mockResolvedValue(repitencia);
      const result = await service.create({ courseCode: 'EIF-101' } as any);
      expect(repo.save).toHaveBeenCalled();
      expect(result).toMatchObject({ id: 'r1' });
    });
  });

  // ── findAll ───────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('debe retornar lista paginada', async () => {
      repo.findAll.mockResolvedValue({ data: [repitencia], meta: { total: 1 } });
      const result = await service.findAll(1, 10);
      expect(repo.findAll).toHaveBeenCalledWith(1, 10);
      expect(result.data).toHaveLength(1);
    });

    it('debe funcionar sin parámetros', async () => {
      repo.findAll.mockResolvedValue({ data: [], meta: { total: 0 } });
      await service.findAll();
      expect(repo.findAll).toHaveBeenCalledWith(undefined, undefined);
    });
  });

  // ── findById ──────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('debe retornar la repitencia por id', async () => {
      repo.findById.mockResolvedValue(repitencia);
      const result = await service.findById('r1');
      expect(result).toMatchObject({ id: 'r1' });
    });

    it('debe retornar null si no existe', async () => {
      repo.findById.mockResolvedValue(null);
      const result = await service.findById('no-existe');
      expect(result).toBeNull();
    });
  });

  // ── update ────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('debe delegar la actualización al repositorio', async () => {
      repo.update.mockResolvedValue({ ...repitencia, courseCode: 'EIF-202' });
      const result = await service.update('r1', { courseCode: 'EIF-202' } as any);
      expect(repo.update).toHaveBeenCalledWith('r1', expect.objectContaining({ courseCode: 'EIF-202' }));
      expect(result).toMatchObject({ courseCode: 'EIF-202' });
    });
  });

  // ── delete ────────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('debe eliminar la repitencia', async () => {
      repo.deleteById.mockResolvedValue(true);
      const result = await service.delete('r1');
      expect(repo.deleteById).toHaveBeenCalledWith('r1');
      expect(result).toBe(true);
    });
  });

  // ── findByCampus ──────────────────────────────────────────────────────────

  describe('findByCampus', () => {
    it('debe filtrar por campusId', async () => {
      repo.findByCampus.mockResolvedValue([repitencia]);
      const result = await service.findByCampus('campus-1');
      expect(repo.findByCampus).toHaveBeenCalledWith('campus-1');
      expect(result).toHaveLength(1);
    });
  });

  // ── findByCourse ──────────────────────────────────────────────────────────

  describe('findByCourse', () => {
    it('debe filtrar por courseId', async () => {
      repo.findByCourse.mockResolvedValue([repitencia]);
      const result = await service.findByCourse('course-1');
      expect(repo.findByCourse).toHaveBeenCalledWith('course-1');
      expect(result).toHaveLength(1);
    });
  });

  // ── findByAcademicCycle ───────────────────────────────────────────────────

  describe('findByAcademicCycle', () => {
    it('debe filtrar por academicCycleId', async () => {
      repo.findByAcademicCycle.mockResolvedValue([repitencia]);
      const result = await service.findByAcademicCycle('cycle-1');
      expect(repo.findByAcademicCycle).toHaveBeenCalledWith('cycle-1');
      expect(result).toHaveLength(1);
    });
  });

  // ── findByCampusAllocation ────────────────────────────────────────────────

  describe('findByCampusAllocation', () => {
    it('debe filtrar por campusAllocationId', async () => {
      repo.findByCampusAllocation.mockResolvedValue([repitencia]);
      const result = await service.findByCampusAllocation('alloc-1');
      expect(repo.findByCampusAllocation).toHaveBeenCalledWith('alloc-1');
      expect(result).toHaveLength(1);
    });
  });

  // ── calculateTotalAdditionalHours ─────────────────────────────────────────

  describe('calculateTotalAdditionalHours', () => {
    it('debe retornar el total envuelto en objeto', async () => {
      repo.calculateTotalAdditionalHours.mockResolvedValue(42);
      const result = await service.calculateTotalAdditionalHours('alloc-1');
      expect(result).toEqual({ total: 42 });
    });

    it('debe retornar 0 si no hay horas', async () => {
      repo.calculateTotalAdditionalHours.mockResolvedValue(0);
      const result = await service.calculateTotalAdditionalHours('alloc-empty');
      expect(result.total).toBe(0);
    });
  });

  // ── getStatistics ─────────────────────────────────────────────────────────

  describe('getStatistics', () => {
    it('debe retornar las estadísticas del repositorio', async () => {
      const stats = { total: 10, active: 8 };
      repo.getStatistics.mockResolvedValue(stats);
      const result = await service.getStatistics();
      expect(result).toEqual(stats);
    });
  });
});
