/**
 * Pruebas unitarias — ProfessorAssignmentsService
 *
 * Cubre:
 *  - save → validaciones de campos obligatorios, sin config activa, con config
 *           + campusAllocationId (existe / no existe)
 *           + curricularMeshCourseId (existe / no existe)
 *           + institutionalProjectId (existe / no existe)
 *           + notes, auditFields
 *           + error en prisma.create
 *  - calcJourney → todos los tipos (FULL, HALF, QUARTER, THREE_QUARTER, default)
 *  - findAll → mapeo correcto de relaciones
 */

import { BadRequestException, Logger } from '@nestjs/common';
import { ProfessorAssignmentsService } from '@modules/professor-assignments/professor-assignments.service';
import { ProfessorAssignmentsRepository } from '@modules/professor-assignments/professor-assignments.repository';
import { DtoValidator } from '@core/common/dto-validator';
import { PrismaService } from '@src/prisma/prisma.service';
import { AssignmentType } from '@modules/professor-assignments/dtos/professor-assignment.dto';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockRepo = () => ({
  save: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  deleteById: jest.fn(),
  findOne: jest.fn(),
  count: jest.fn(),
});

const mockPrisma = () => ({
  journeyTimeCalculationConfig: { findFirst: jest.fn() },
  campusJourneyTimeAllocation: { findUnique: jest.fn() },
  curricularMeshCourse: { findUnique: jest.fn() },
  institutionalProject: { findUnique: jest.fn() },
  professorAssignment: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
});

const mockDtoValidator = () => ({
  validate: jest.fn().mockImplementation(async (e) => e),
});

// ─── Datos base ───────────────────────────────────────────────────────────────

const configActiva = {
  id: 'cfg-1',
  isActive: true,
  fullTimeValue: 40,
  halfTimeValue: 20,
  quarterTimeValue: 10,
  threeQuarterTimeValue: 30,
};

const payloadBase = {
  professorId: 'prof-1',
  academicCycleId: 'cycle-1',
  campusId: 'campus-1',
  assignmentType: AssignmentType.FULL,
};

const assignmentCreado = {
  id: 'assign-1',
  professorId: 'prof-1',
  professor: { fullName: 'Ana García', nationalId: '123456' },
  academicCycleId: 'cycle-1',
  academicCycle: { name: 'I-2024' },
  campusId: 'campus-1',
  campus: { name: 'Campus Central' },
  curricularMeshCourse: null,
  assignmentType: 'FULL',
  calculatedJourneyTime: 40,
  status: 'ACTIVE',
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('ProfessorAssignmentsService', () => {
  let service: ProfessorAssignmentsService;
  let repo: ReturnType<typeof mockRepo>;
  let prisma: ReturnType<typeof mockPrisma>;

  beforeEach(() => {
    repo = mockRepo();
    prisma = mockPrisma();
    service = new ProfessorAssignmentsService(
      repo as unknown as ProfessorAssignmentsRepository,
      mockDtoValidator() as unknown as DtoValidator,
      prisma as unknown as PrismaService,
    );
    jest.spyOn(service['logger'] as Logger, 'log').mockImplementation(() => {});
    jest.spyOn(service['logger'] as Logger, 'error').mockImplementation(() => {});
    jest.spyOn(service['logger'] as Logger, 'warn').mockImplementation(() => {});
    jest.spyOn(service['logger'] as Logger, 'debug').mockImplementation(() => {});
  });

  // ── save — validaciones ───────────────────────────────────────────────────

  describe('save — validaciones', () => {
    it('debe lanzar BadRequestException si professorId falta', async () => {
      await expect(service.save({ ...payloadBase, professorId: '' } as any))
        .rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si academicCycleId falta', async () => {
      await expect(service.save({ ...payloadBase, academicCycleId: '  ' } as any))
        .rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si campusId falta', async () => {
      await expect(service.save({ ...payloadBase, campusId: '' } as any))
        .rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si assignmentType falta', async () => {
      await expect(service.save({ ...payloadBase, assignmentType: undefined } as any))
        .rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si no hay config activa', async () => {
      prisma.journeyTimeCalculationConfig.findFirst.mockResolvedValue(null);
      await expect(service.save(payloadBase as any)).rejects.toThrow(BadRequestException);
    });
  });

  // ── save — flujo exitoso ──────────────────────────────────────────────────

  describe('save — flujo exitoso', () => {
    beforeEach(() => {
      prisma.journeyTimeCalculationConfig.findFirst.mockResolvedValue(configActiva);
      prisma.professorAssignment.create.mockResolvedValue(assignmentCreado);
    });

    it('debe crear asignación FULL con calculatedJourneyTime=40', async () => {
      const result = await service.save(payloadBase as any);
      expect(prisma.professorAssignment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ calculatedJourneyTime: 40, assignmentType: 'FULL' }),
        }),
      );
      expect(result).toMatchObject({ id: 'assign-1' });
    });

    it('debe crear asignación HALF con calculatedJourneyTime=20', async () => {
      await service.save({ ...payloadBase, assignmentType: AssignmentType.HALF } as any);
      const data = prisma.professorAssignment.create.mock.calls[0][0].data;
      expect(data.calculatedJourneyTime).toBe(20);
    });

    it('debe crear asignación QUARTER con calculatedJourneyTime=10', async () => {
      await service.save({ ...payloadBase, assignmentType: AssignmentType.QUARTER } as any);
      const data = prisma.professorAssignment.create.mock.calls[0][0].data;
      expect(data.calculatedJourneyTime).toBe(10);
    });

    it('debe crear asignación THREE_QUARTER con calculatedJourneyTime=30', async () => {
      await service.save({ ...payloadBase, assignmentType: AssignmentType.THREE_QUARTER } as any);
      const data = prisma.professorAssignment.create.mock.calls[0][0].data;
      expect(data.calculatedJourneyTime).toBe(30);
    });

    it('debe usar 0 para tipo desconocido', async () => {
      await service.save({ ...payloadBase, assignmentType: 'UNKNOWN' as any });
      const data = prisma.professorAssignment.create.mock.calls[0][0].data;
      expect(data.calculatedJourneyTime).toBe(0);
    });

    it('debe usar 0.75 si threeQuarterTimeValue es null/undefined', async () => {
      prisma.journeyTimeCalculationConfig.findFirst.mockResolvedValue({
        ...configActiva,
        threeQuarterTimeValue: null,
      });
      await service.save({ ...payloadBase, assignmentType: AssignmentType.THREE_QUARTER } as any);
      const data = prisma.professorAssignment.create.mock.calls[0][0].data;
      expect(data.calculatedJourneyTime).toBe(0.75);
    });
  });

  // ── save — relaciones opcionales ──────────────────────────────────────────

  describe('save — relaciones opcionales', () => {
    beforeEach(() => {
      prisma.journeyTimeCalculationConfig.findFirst.mockResolvedValue(configActiva);
      prisma.professorAssignment.create.mockResolvedValue(assignmentCreado);
    });

    it('debe conectar campusAllocation si existe', async () => {
      prisma.campusJourneyTimeAllocation.findUnique.mockResolvedValue({ id: 'alloc-1' });
      await service.save({ ...payloadBase, campusAllocationId: 'alloc-1' } as any);
      const data = prisma.professorAssignment.create.mock.calls[0][0].data;
      expect(data.campusAllocation).toEqual({ connect: { id: 'alloc-1' } });
    });

    it('debe omitir campusAllocation si no existe en BD', async () => {
      prisma.campusJourneyTimeAllocation.findUnique.mockResolvedValue(null);
      await service.save({ ...payloadBase, campusAllocationId: 'no-existe' } as any);
      const data = prisma.professorAssignment.create.mock.calls[0][0].data;
      expect(data.campusAllocation).toBeUndefined();
    });

    it('debe conectar curricularMeshCourse si existe', async () => {
      prisma.curricularMeshCourse.findUnique.mockResolvedValue({ id: 'cmc-1' });
      await service.save({ ...payloadBase, curricularMeshCourseId: 'cmc-1' } as any);
      const data = prisma.professorAssignment.create.mock.calls[0][0].data;
      expect(data.curricularMeshCourse).toEqual({ connect: { id: 'cmc-1' } });
    });

    it('debe omitir curricularMeshCourse si no existe en BD', async () => {
      prisma.curricularMeshCourse.findUnique.mockResolvedValue(null);
      await service.save({ ...payloadBase, curricularMeshCourseId: 'no-existe' } as any);
      const data = prisma.professorAssignment.create.mock.calls[0][0].data;
      expect(data.curricularMeshCourse).toBeUndefined();
    });

    it('debe conectar institutionalProject si existe', async () => {
      prisma.institutionalProject.findUnique.mockResolvedValue({ id: 'proj-1' });
      await service.save({ ...payloadBase, institutionalProjectId: 'proj-1' } as any);
      const data = prisma.professorAssignment.create.mock.calls[0][0].data;
      expect(data.institutionalProject).toEqual({ connect: { id: 'proj-1' } });
    });

    it('debe omitir institutionalProject si no existe en BD', async () => {
      prisma.institutionalProject.findUnique.mockResolvedValue(null);
      await service.save({ ...payloadBase, institutionalProjectId: 'no-existe' } as any);
      const data = prisma.professorAssignment.create.mock.calls[0][0].data;
      expect(data.institutionalProject).toBeUndefined();
    });

    it('debe incluir notes si se proporcionan', async () => {
      await service.save({ ...payloadBase, notes: 'Nota importante' } as any);
      const data = prisma.professorAssignment.create.mock.calls[0][0].data;
      expect(data.notes).toBe('Nota importante');
    });

    it('debe propagar auditFields si están presentes', async () => {
      await service.save({ ...payloadBase, createdBy: 'admin-1' } as any);
      const data = prisma.professorAssignment.create.mock.calls[0][0].data;
      expect(data.createdBy).toBe('admin-1');
    });
  });

  // ── save — error en create ────────────────────────────────────────────────

  describe('save — error en create', () => {
    it('debe propagar errores de prisma.create', async () => {
      prisma.journeyTimeCalculationConfig.findFirst.mockResolvedValue(configActiva);
      prisma.professorAssignment.create.mockRejectedValue(new Error('Unique constraint failed'));
      await expect(service.save(payloadBase as any)).rejects.toThrow('Unique constraint failed');
    });
  });

  // ── findAll ───────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('debe retornar asignaciones mapeadas con nombres de relaciones', async () => {
      prisma.professorAssignment.findMany.mockResolvedValue([assignmentCreado]);

      const result = await service.findAll(1, 10);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toMatchObject({
        id: 'assign-1',
        professorName: 'Ana García',
        cycleName: 'I-2024',
        campusName: 'Campus Central',
      });
      expect(result.meta).toMatchObject({ page: 1, limit: 10, total: 1 });
    });

    it('debe usar valores por defecto si relaciones son null', async () => {
      prisma.professorAssignment.findMany.mockResolvedValue([{
        ...assignmentCreado,
        professor: null,
        academicCycle: null,
        campus: null,
        curricularMeshCourse: null,
      }]);

      const result = await service.findAll();
      expect(result.data[0].professorName).toBe('Sin nombre');
      expect(result.data[0].cycleName).toBe('Sin ciclo');
      expect(result.data[0].campusName).toBe('Sin campus');
      expect(result.data[0].careerName).toBe('Sin carrera');
    });

    it('debe retornar lista vacía si no hay asignaciones', async () => {
      prisma.professorAssignment.findMany.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });
});
