/**
 * Pruebas unitarias — InstitutionalProjectsService
 *
 * Cubre:
 *  - create              → con y sin startDate/endDate, con campusAllocationId/directorId
 *  - findAll             → delega al repo
 *  - findById            → delega al repo
 *  - update              → con relaciones opcionales, con fechas
 *  - delete              → delega al repo
 *  - findByCampusAllocation
 *  - findByDirector
 *  - calculateTotalAssignedTime → retorna { total }
 *  - findWithAvailableTime
 */

import { InstitutionalProjectsService } from '@modules/institutional-projects/institutional-projects.service';
import { InstitutionalProjectsRepository } from '@modules/institutional-projects/institutional-projects.repository';

const mockRepo = () => ({
  save: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  deleteById: jest.fn(),
  findByCampusAllocation: jest.fn(),
  findByDirector: jest.fn(),
  calculateTotalAssignedTime: jest.fn(),
  findWithAvailableTime: jest.fn(),
});

const proyectoBase = {
  id: 'proj-1',
  name: 'Proyecto Alpha',
  assignedJourneyTime: 20,
  status: 'ACTIVE',
};

describe('InstitutionalProjectsService', () => {
  let service: InstitutionalProjectsService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(() => {
    repo = mockRepo();
    service = new InstitutionalProjectsService(repo as unknown as InstitutionalProjectsRepository);
  });

  // ── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('debe crear proyecto con campusAllocationId y directorId como connect', async () => {
      repo.save.mockResolvedValue(proyectoBase);
      const dto = { name: 'Proyecto Alpha', campusAllocationId: 'alloc-1', directorId: 'user-1' };
      const result = await service.create(dto as any);
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          campusAllocation: { connect: { id: 'alloc-1' } },
          director: { connect: { id: 'user-1' } },
        }),
      );
      expect(result).toMatchObject({ id: 'proj-1' });
    });

    it('debe incluir startDate como ISO string si se proporciona', async () => {
      repo.save.mockResolvedValue(proyectoBase);
      await service.create({ name: 'P', campusAllocationId: 'a', directorId: 'u', startDate: '2024-01-15' } as any);
      const saved = repo.save.mock.calls[0][0];
      expect(saved.startDate).toBe(new Date('2024-01-15').toISOString());
    });

    it('debe incluir endDate como ISO string si se proporciona', async () => {
      repo.save.mockResolvedValue(proyectoBase);
      await service.create({ name: 'P', campusAllocationId: 'a', directorId: 'u', endDate: '2024-12-31' } as any);
      const saved = repo.save.mock.calls[0][0];
      expect(saved.endDate).toBe(new Date('2024-12-31').toISOString());
    });

    it('debe omitir startDate/endDate si no se proporcionan', async () => {
      repo.save.mockResolvedValue(proyectoBase);
      await service.create({ name: 'P', campusAllocationId: 'a', directorId: 'u' } as any);
      const saved = repo.save.mock.calls[0][0];
      expect(saved.startDate).toBeUndefined();
      expect(saved.endDate).toBeUndefined();
    });
  });

  // ── findAll ───────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('debe delegar al repositorio', async () => {
      repo.findAll.mockResolvedValue({ data: [proyectoBase], meta: { total: 1 } });
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
    it('debe retornar el proyecto por id', async () => {
      repo.findById.mockResolvedValue(proyectoBase);
      const result = await service.findById('proj-1');
      expect(result).toMatchObject({ id: 'proj-1' });
    });

    it('debe retornar null si no existe', async () => {
      repo.findById.mockResolvedValue(null);
      const result = await service.findById('no-existe');
      expect(result).toBeNull();
    });
  });

  // ── update ────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('debe actualizar sin relaciones opcionales', async () => {
      repo.update.mockResolvedValue({ ...proyectoBase, name: 'Nuevo nombre' });
      const result = await service.update('proj-1', { name: 'Nuevo nombre' } as any);
      expect(repo.update).toHaveBeenCalledWith('proj-1', expect.objectContaining({ name: 'Nuevo nombre' }));
    });

    it('debe incluir campusAllocation connect si se proporciona', async () => {
      repo.update.mockResolvedValue(proyectoBase);
      await service.update('proj-1', { campusAllocationId: 'alloc-2' } as any);
      const updated = repo.update.mock.calls[0][1];
      expect(updated.campusAllocation).toEqual({ connect: { id: 'alloc-2' } });
    });

    it('debe incluir director connect si se proporciona', async () => {
      repo.update.mockResolvedValue(proyectoBase);
      await service.update('proj-1', { directorId: 'user-2' } as any);
      const updated = repo.update.mock.calls[0][1];
      expect(updated.director).toEqual({ connect: { id: 'user-2' } });
    });

    it('debe parsear startDate y endDate si se proporcionan', async () => {
      repo.update.mockResolvedValue(proyectoBase);
      await service.update('proj-1', { startDate: '2024-03-01', endDate: '2024-06-30' } as any);
      const updated = repo.update.mock.calls[0][1];
      expect(updated.startDate).toBe(new Date('2024-03-01').toISOString());
      expect(updated.endDate).toBe(new Date('2024-06-30').toISOString());
    });

    it('debe omitir startDate/endDate si no se proporcionan', async () => {
      repo.update.mockResolvedValue(proyectoBase);
      await service.update('proj-1', { name: 'X' } as any);
      const updated = repo.update.mock.calls[0][1];
      expect(updated.startDate).toBeUndefined();
      expect(updated.endDate).toBeUndefined();
    });
  });

  // ── delete ────────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('debe eliminar el proyecto', async () => {
      repo.deleteById.mockResolvedValue(true);
      const result = await service.delete('proj-1');
      expect(repo.deleteById).toHaveBeenCalledWith('proj-1');
      expect(result).toBe(true);
    });
  });

  // ── findByCampusAllocation ────────────────────────────────────────────────

  describe('findByCampusAllocation', () => {
    it('debe retornar proyectos filtrados por campusAllocationId', async () => {
      repo.findByCampusAllocation.mockResolvedValue([proyectoBase]);
      const result = await service.findByCampusAllocation('alloc-1');
      expect(repo.findByCampusAllocation).toHaveBeenCalledWith('alloc-1');
      expect(result).toHaveLength(1);
    });
  });

  // ── findByDirector ────────────────────────────────────────────────────────

  describe('findByDirector', () => {
    it('debe retornar proyectos filtrados por directorId', async () => {
      repo.findByDirector.mockResolvedValue([proyectoBase]);
      const result = await service.findByDirector('user-1');
      expect(repo.findByDirector).toHaveBeenCalledWith('user-1');
      expect(result).toHaveLength(1);
    });
  });

  // ── calculateTotalAssignedTime ─────────────────────────────────────────────

  describe('calculateTotalAssignedTime', () => {
    it('debe retornar el total envuelto en objeto { total }', async () => {
      repo.calculateTotalAssignedTime.mockResolvedValue(42);
      const result = await service.calculateTotalAssignedTime('alloc-1');
      expect(result).toEqual({ total: 42 });
    });

    it('debe retornar { total: 0 } si no hay asignaciones', async () => {
      repo.calculateTotalAssignedTime.mockResolvedValue(0);
      const result = await service.calculateTotalAssignedTime('alloc-vacio');
      expect(result.total).toBe(0);
    });
  });

  // ── findWithAvailableTime ─────────────────────────────────────────────────

  describe('findWithAvailableTime', () => {
    it('debe retornar proyectos con tiempo disponible', async () => {
      repo.findWithAvailableTime.mockResolvedValue([proyectoBase]);
      const result = await service.findWithAvailableTime();
      expect(repo.findWithAvailableTime).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });
});
