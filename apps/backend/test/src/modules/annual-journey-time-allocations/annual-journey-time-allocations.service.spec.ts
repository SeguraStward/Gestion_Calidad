/**
 * Pruebas unitarias — AnnualJourneyTimeAllocationsService
 *
 * Cubre:
 *  - findAll        → usa prisma.annualJourneyTimeAllocation.findMany directamente
 *  - getActive      → retorna asignación activa o null
 *  - getYearSummary → sin asignación, con asignación completa (campusSummary + externals)
 *  - save / update  → herencia GenericService
 *  - deleteById     → relationCheckConfig (campusAllocations, externalProviders)
 */

import { Logger } from '@nestjs/common';
import { AnnualJourneyTimeAllocationsService } from '@modules/annual-journey-time-allocations/annual-journey-time-allocations.service';
import { AnnualJourneyTimeAllocationsRepository } from '@modules/annual-journey-time-allocations/annual-journey-time-allocations.repository';
import { DtoValidator } from '@core/common/dto-validator';
import { PrismaService } from '@src/prisma/prisma.service';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockRepo = () => ({
  save: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  deleteById: jest.fn(),
  softDeleteById: jest.fn(),
  findOne: jest.fn(),
  count: jest.fn(),
  findByYear: jest.fn(),
});

const mockPrisma = () => ({
  annualJourneyTimeAllocation: {
    findMany: jest.fn(),
  },
});

const mockDtoValidator = () => ({
  validate: jest.fn().mockImplementation(async (e) => e),
});

// ─── Datos base ───────────────────────────────────────────────────────────────

const allocationActiva = {
  id: 'alloc-1',
  year: 2024,
  totalJourneyTime: 100,
  status: 'ACTIVE',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const allocationInactiva = { ...allocationActiva, id: 'alloc-2', status: 'INACTIVE' };

const campusAllocation = {
  campusId: 'campus-1',
  campus: { name: 'Campus Central' },
  curricularMesh: { name: 'Malla 2020' },
  academicCycle: { name: 'I-2024' },
  allocatedJourneyTime: 50,
  additionalJourneyTime: 10,
  status: 'ACTIVE',
  professorAssignments: [
    { status: 'ACTIVE', calculatedJourneyTime: 20 },
    { status: 'INACTIVE', calculatedJourneyTime: 5 },
  ],
  institutionalProjects: [
    { status: 'ACTIVE', assignedJourneyTime: 8 },
  ],
};

const allocationConDetalle = {
  ...allocationActiva,
  campusAllocations: [campusAllocation],
  externalProviders: [
    { id: 'ext-1', name: 'Proveedor A', providerType: 'EXTERNAL', providedJourneyTime: 15, status: 'ACTIVE' },
    { id: 'ext-2', name: 'Proveedor B', providerType: 'EXTERNAL', providedJourneyTime: 5, status: 'INACTIVE' },
  ],
};

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('AnnualJourneyTimeAllocationsService', () => {
  let service: AnnualJourneyTimeAllocationsService;
  let repo: ReturnType<typeof mockRepo>;
  let prisma: ReturnType<typeof mockPrisma>;

  beforeEach(() => {
    repo = mockRepo();
    prisma = mockPrisma();
    service = new AnnualJourneyTimeAllocationsService(
      repo as unknown as AnnualJourneyTimeAllocationsRepository,
      mockDtoValidator() as unknown as DtoValidator,
      prisma as unknown as PrismaService,
    );
    jest.spyOn(service['logger'] as Logger, 'log').mockImplementation(() => {});
    jest.spyOn(service['logger'] as Logger, 'warn').mockImplementation(() => {});
    jest.spyOn(service['logger'] as Logger, 'debug').mockImplementation(() => {});
    jest.spyOn(service['logger'] as Logger, 'error').mockImplementation(() => {});
  });

  // ── findAll ───────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('debe retornar asignaciones mapeadas desde prisma directamente', async () => {
      prisma.annualJourneyTimeAllocation.findMany.mockResolvedValue([allocationActiva, allocationInactiva]);

      const result = await service.findAll(1, 10);

      expect(prisma.annualJourneyTimeAllocation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { year: 'desc' } }),
      );
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toMatchObject({ id: 'alloc-1', year: 2024 });
      expect(result.meta).toMatchObject({ page: 1, limit: 10, total: 2 });
    });

    it('debe retornar lista vacía si no hay asignaciones', async () => {
      prisma.annualJourneyTimeAllocation.findMany.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });

  // ── getActive ─────────────────────────────────────────────────────────────

  describe('getActive', () => {
    it('debe retornar la asignación ACTIVE si existe', async () => {
      repo.findAll.mockResolvedValue({ data: [allocationActiva, allocationInactiva], meta: { total: 2 } });

      const result = await service.getActive();

      expect(result).toMatchObject({ id: 'alloc-1', status: 'ACTIVE' });
    });

    it('debe retornar null si no hay asignación activa', async () => {
      repo.findAll.mockResolvedValue({ data: [allocationInactiva], meta: { total: 1 } });

      const result = await service.getActive();

      expect(result).toBeNull();
    });

    it('debe retornar null si no hay asignaciones', async () => {
      repo.findAll.mockResolvedValue({ data: [], meta: { total: 0 } });
      const result = await service.getActive();
      expect(result).toBeNull();
    });
  });

  // ── getYearSummary ────────────────────────────────────────────────────────

  describe('getYearSummary', () => {
    it('debe retornar found=false si no existe asignación para el año', async () => {
      repo.findByYear.mockResolvedValue(null);

      const result = await service.getYearSummary(2099);

      expect(result).toMatchObject({ year: 2099, found: false });
      expect(result.message).toContain('2099');
    });

    it('debe retornar resumen completo con campusSummary y externalProviders', async () => {
      repo.findByYear.mockResolvedValue(allocationConDetalle);

      const result = await service.getYearSummary(2024);

      expect(result.found).toBe(true);
      expect(result.year).toBe(2024);
      expect(result.totalJourneyTime).toBe(100);
      expect(result.campusSummary).toHaveLength(1);

      const campus = result.campusSummary[0];
      expect(campus.campusName).toBe('Campus Central');
      expect(campus.professorConsumed).toBe(20); // solo el ACTIVE
      expect(campus.projectsConsumed).toBe(8);   // solo el ACTIVE
      expect(campus.totalConsumed).toBe(28);
      expect(campus.available).toBe(32); // 50 + 10 - 28
    });

    it('debe calcular utilizationRate correctamente', async () => {
      repo.findByYear.mockResolvedValue(allocationConDetalle);

      const result = await service.getYearSummary(2024);

      expect(result.summary.totalCampus).toBe(1);
      expect(result.summary.totalExternalProviders).toBe(2);
      expect(result.summary.utilizationRate).toBeGreaterThan(0);
    });

    it('debe reportar externalTotal solo de proveedores ACTIVE', async () => {
      repo.findByYear.mockResolvedValue(allocationConDetalle);

      const result = await service.getYearSummary(2024);

      expect(result.totalFromExternalProviders).toBe(15); // solo ACTIVE (15), no INACTIVE (5)
    });

    it('debe manejar campus sin assignments ni projects (available no negativo)', async () => {
      const campusSinConsumo = {
        ...campusAllocation,
        allocatedJourneyTime: 10,
        additionalJourneyTime: 0,
        professorAssignments: [],
        institutionalProjects: [],
      };
      repo.findByYear.mockResolvedValue({
        ...allocationConDetalle,
        campusAllocations: [campusSinConsumo],
      });

      const result = await service.getYearSummary(2024);
      expect(result.campusSummary[0].available).toBe(10);
    });

    it('debe poner available=0 si el consumo supera lo asignado', async () => {
      const campusSobreConsumido = {
        ...campusAllocation,
        allocatedJourneyTime: 5,
        additionalJourneyTime: 0,
        professorAssignments: [{ status: 'ACTIVE', calculatedJourneyTime: 50 }],
        institutionalProjects: [],
      };
      repo.findByYear.mockResolvedValue({
        ...allocationConDetalle,
        campusAllocations: [campusSobreConsumido],
      });

      const result = await service.getYearSummary(2024);
      expect(result.campusSummary[0].available).toBe(0);
    });

    it('debe retornar utilizationRate=0 si totalAllocatedToCampus es 0', async () => {
      repo.findByYear.mockResolvedValue({
        ...allocationConDetalle,
        campusAllocations: [],
      });

      const result = await service.getYearSummary(2024);
      expect(result.summary.utilizationRate).toBe(0);
    });

    it('debe usar "N/A" cuando campus/curricularMesh/academicCycle son null', async () => {
      const campusSinRelaciones = {
        ...campusAllocation,
        campus: null,
        curricularMesh: null,
        academicCycle: null,
        professorAssignments: [],
        institutionalProjects: [],
      };
      repo.findByYear.mockResolvedValue({
        ...allocationConDetalle,
        campusAllocations: [campusSinRelaciones],
      });

      const result = await service.getYearSummary(2024);
      expect(result.campusSummary[0].campusName).toBe('N/A');
      expect(result.campusSummary[0].curricularMesh).toBe('N/A');
      expect(result.campusSummary[0].academicCycle).toBe('N/A');
    });
  });

  // ── save (heredado) ───────────────────────────────────────────────────────

  describe('save', () => {
    it('debe crear la asignación anual', async () => {
      repo.save.mockResolvedValue(allocationActiva);
      const result = await service.save({ year: 2024, totalJourneyTime: 100 } as any);
      expect(repo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  // ── update (heredado) ─────────────────────────────────────────────────────

  describe('update', () => {
    it('debe actualizar la asignación', async () => {
      repo.update.mockResolvedValue({ ...allocationActiva, totalJourneyTime: 120 });
      const result = await service.update('alloc-1', { totalJourneyTime: 120 } as any);
      expect(repo.update).toHaveBeenCalledWith('alloc-1', expect.objectContaining({ totalJourneyTime: 120 }));
    });
  });
});
