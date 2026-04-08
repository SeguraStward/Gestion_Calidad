/**
 * Pruebas unitarias — AcademicLoadsService
 *
 * Cubre:
 *  - save           → cálculo de availableSeats, parseo de fecha (string YYYY-MM-DD, Date, null, invalid)
 *  - update         → recálculo de availableSeats, parseo de fecha (string, Date, null), sin fecha
 *  - findById       → delega con FULL_INCLUDE
 *  - findAll        → delega con FULL_INCLUDE
 *  - findAllByProfessorId → con y sin status
 *  - delete         → no-existe lanza Error, existe delega a super.delete
 *  - bulkImportAcademicLoads → flujo completo y todas las ramas de error
 */

import { Logger } from '@nestjs/common';
import { AcademicLoadsService } from '@modules/academic-loads/academic-loads.service';
import { AcademicLoadsRepository } from '@modules/academic-loads/academic-loads.repository';
import { DtoValidator } from '@core/common/dto-validator';
import { PrismaService } from '@src/prisma/prisma.service';
import { Status } from '@una-gc/database/prisma/generated/client';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockRepo = () => ({
  save: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  deleteById: jest.fn(),
  findOne: jest.fn(),
  count: jest.fn(),
  softDeleteById: jest.fn(),
});

const mockPrisma = () => ({
  campus: { findFirst: jest.fn() },
  academicCycle: { findFirst: jest.fn() },
  course: { findFirst: jest.fn() },
  academicLoadGroup: { findFirst: jest.fn(), create: jest.fn() },
  user: { findFirst: jest.fn() },
  schedule: { findFirst: jest.fn(), create: jest.fn() },
  classroom: { findFirst: jest.fn() },
  academicLoad: { findFirst: jest.fn(), update: jest.fn(), create: jest.fn() },
});

const mockDtoValidator = () => ({
  validate: jest.fn().mockImplementation(async (e) => e),
});

// ─── Datos base ───────────────────────────────────────────────────────────────

const cargaDto = {
  nrc: 'NRC-001',
  maximumCapacity: 30,
  enrolledCapacity: 20,
  status: Status.ACTIVE,
  academicCycleId: 'cycle-1',
  campusId: 'campus-1',
  courseId: 'course-1',
  groupId: 'group-1',
  professorId: 'prof-1',
};

const cargaCreada = { id: 'al-1', nrc: 'NRC-001', maximumCapacity: 30, enrolledCapacity: 20, availableSeats: 10 };

// ─── Helper para carga válida en bulkImport ───────────────────────────────────

const loadValido = {
  nrc: 'NRC-100',
  campus: 'Campus Central',
  ciclo: 'I-2024',
  cupoMaximo: 30,
  cupoMatricula: 20,
  cupoDisponible: 10,
  curso: 'EIF-101',
  grupo: 'G01',
  profesorCedula: '123456789',
};

// ─── Suite principal ──────────────────────────────────────────────────────────

describe('AcademicLoadsService', () => {
  let service: AcademicLoadsService;
  let repo: ReturnType<typeof mockRepo>;
  let prisma: ReturnType<typeof mockPrisma>;

  beforeEach(() => {
    repo = mockRepo();
    prisma = mockPrisma();
    service = new AcademicLoadsService(
      repo as unknown as AcademicLoadsRepository,
      mockDtoValidator() as unknown as DtoValidator,
      prisma as unknown as PrismaService,
    );
    jest.spyOn(service['logger'] as Logger, 'log').mockImplementation(() => {});
    jest.spyOn(service['logger'] as Logger, 'error').mockImplementation(() => {});
    jest.spyOn(service['logger'] as Logger, 'debug').mockImplementation(() => {});
    jest.spyOn(service['logger'] as Logger, 'warn').mockImplementation(() => {});
  });

  // ── save ──────────────────────────────────────────────────────────────────

  describe('save', () => {
    beforeEach(() => {
      repo.save.mockResolvedValue(cargaCreada);
      repo.findById.mockResolvedValue(cargaCreada);
    });

    it('debe calcular availableSeats y crear la carga', async () => {
      const result = await service.save(cargaDto as any);
      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ availableSeats: 10 }));
      expect(result).toMatchObject({ id: 'al-1' });
    });

    it('debe parsear fecha string YYYY-MM-DD correctamente', async () => {
      await service.save({ ...cargaDto, date: '2024-06-01' } as any);
      const saved = repo.save.mock.calls[0][0];
      expect(saved.date).toBeInstanceOf(Date);
    });

    it('debe parsear fecha string con hora correctamente', async () => {
      await service.save({ ...cargaDto, date: '2024-06-01T10:00:00.000Z' } as any);
      const saved = repo.save.mock.calls[0][0];
      expect(saved.date).toBeInstanceOf(Date);
    });

    it('debe parsear fecha como instancia Date', async () => {
      const fecha = new Date('2024-06-01');
      await service.save({ ...cargaDto, date: fecha } as any);
      const saved = repo.save.mock.calls[0][0];
      expect(saved.date).toBe(fecha);
    });

    it('debe manejar fecha inválida (Invalid Date) sin incluirla', async () => {
      await service.save({ ...cargaDto, date: 'not-a-date' } as any);
      const saved = repo.save.mock.calls[0][0];
      expect(saved.date).toBeUndefined();
    });

    it('debe omitir fecha si es null', async () => {
      await service.save({ ...cargaDto, date: null } as any);
      const saved = repo.save.mock.calls[0][0];
      expect(saved.date).toBeUndefined();
    });

    it('debe incluir classroomId y scheduleId cuando se proporcionan', async () => {
      await service.save({ ...cargaDto, classroomId: 'cl-1', scheduleId: 'sch-1' } as any);
      const saved = repo.save.mock.calls[0][0];
      expect(saved.classroom).toEqual({ connect: { id: 'cl-1' } });
      expect(saved.schedule).toEqual({ connect: { id: 'sch-1' } });
    });

    it('debe parsear fecha de tipo desconocido con new Date()', async () => {
      await service.save({ ...cargaDto, date: 1717200000000 } as any);
      const saved = repo.save.mock.calls[0][0];
      expect(saved.date).toBeInstanceOf(Date);
    });
  });

  // ── update ────────────────────────────────────────────────────────────────

  describe('update', () => {
    beforeEach(() => {
      repo.findById.mockResolvedValue({ ...cargaCreada, maximumCapacity: 30, enrolledCapacity: 20 });
      repo.update.mockResolvedValue(cargaCreada);
    });

    it('debe recalcular availableSeats si se actualiza maximumCapacity', async () => {
      await service.update('al-1', { maximumCapacity: 40 } as any);
      expect(repo.update).toHaveBeenCalledWith('al-1', expect.objectContaining({ availableSeats: 20 }));
    });

    it('debe recalcular availableSeats si se actualiza enrolledCapacity', async () => {
      await service.update('al-1', { enrolledCapacity: 10 } as any);
      expect(repo.update).toHaveBeenCalledWith('al-1', expect.objectContaining({ availableSeats: 20 }));
    });

    it('no debe calcular availableSeats si no se tocan campos de capacidad', async () => {
      await service.update('al-1', { nrc: 'NRC-999' } as any);
      const updated = repo.update.mock.calls[0][1];
      expect(updated.availableSeats).toBeUndefined();
    });

    it('debe parsear fecha string en update', async () => {
      await service.update('al-1', { date: '2024-09-15' } as any);
      const updated = repo.update.mock.calls[0][1];
      expect(updated.date).toBeInstanceOf(Date);
    });

    it('debe manejar date=null en update (undefined)', async () => {
      await service.update('al-1', { date: null } as any);
      const updated = repo.update.mock.calls[0][1];
      expect(updated.date).toBeUndefined();
    });

    it('debe manejar date instanceof Date en update', async () => {
      const fecha = new Date('2024-09-15');
      await service.update('al-1', { date: fecha } as any);
      const updated = repo.update.mock.calls[0][1];
      expect(updated.date).toBe(fecha);
    });

    it('debe manejar date de tipo desconocido en update', async () => {
      await service.update('al-1', { date: 1717200000000 } as any);
      const updated = repo.update.mock.calls[0][1];
      expect(updated.date).toBeInstanceOf(Date);
    });

    it('debe conectar relaciones cuando se proporcionan IDs', async () => {
      await service.update('al-1', { professorId: 'prof-2', groupId: 'grp-2' } as any);
      const updated = repo.update.mock.calls[0][1];
      expect(updated.professor).toEqual({ connect: { id: 'prof-2' } });
      expect(updated.group).toEqual({ connect: { id: 'grp-2' } });
    });

    it('debe retornar la carga actualizada con findById', async () => {
      const result = await service.update('al-1', { nrc: 'NRC-999' } as any);
      expect(result).toMatchObject({ id: 'al-1' });
    });
  });

  // ── findById ──────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('debe llamar al repositorio con FULL_INCLUDE', async () => {
      repo.findById.mockResolvedValue(cargaCreada);
      const result = await service.findById('al-1');
      expect(repo.findById).toHaveBeenCalledWith('al-1', expect.objectContaining({ academicCycle: true }));
      expect(result).toMatchObject({ id: 'al-1' });
    });

    it('debe retornar null si no existe', async () => {
      repo.findById.mockResolvedValue(null);
      const result = await service.findById('no-existe');
      expect(result).toBeNull();
    });
  });

  // ── findAll ───────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('debe delegar al repositorio con FULL_INCLUDE', async () => {
      repo.findAll.mockResolvedValue({ data: [cargaCreada], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } });
      const result = await service.findAll(1, 10);
      // repo.findAll recibe (page, limit, where, orderBy, include) como args posicionales
      const [page, limit, , , include] = repo.findAll.mock.calls[0];
      expect(page).toBe(1);
      expect(limit).toBe(10);
      expect(include).toMatchObject({ academicCycle: true });
      expect(result.data).toHaveLength(1);
    });
  });

  // ── findAllByProfessorId ──────────────────────────────────────────────────

  describe('findAllByProfessorId', () => {
    it('debe filtrar por professorId sin status', async () => {
      repo.findAll.mockResolvedValue({ data: [cargaCreada], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } });
      await service.findAllByProfessorId('prof-1');
      // args: (page, limit, where, orderBy, include)
      const [, , where] = repo.findAll.mock.calls[0];
      expect(where).toMatchObject({ professorId: 'prof-1' });
      expect(where.status).toBeUndefined();
    });

    it('debe filtrar por professorId con status', async () => {
      repo.findAll.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });
      await service.findAllByProfessorId('prof-1', 1, 10, Status.ACTIVE);
      const [, , where] = repo.findAll.mock.calls[0];
      expect(where).toMatchObject({ professorId: 'prof-1', status: Status.ACTIVE });
    });
  });

  // ── delete ────────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('debe lanzar Error si el registro no existe', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.delete('no-existe')).rejects.toThrow('Academic Load with id no-existe not found');
    });

    it('debe llamar a super.delete si el registro existe', async () => {
      repo.findById.mockResolvedValue(cargaCreada);
      repo.deleteById.mockResolvedValue(true);
      const result = await service.delete('al-1');
      expect(repo.deleteById).toHaveBeenCalledWith('al-1');
      expect(result).toBe(true);
    });
  });

  // ── bulkImportAcademicLoads ───────────────────────────────────────────────

  describe('bulkImportAcademicLoads', () => {
    // Helper para configurar el camino feliz
    const setupHappyPath = () => {
      prisma.campus.findFirst.mockResolvedValue({ id: 'campus-1' });
      prisma.academicCycle.findFirst.mockResolvedValue({ id: 'cycle-1' });
      prisma.course.findFirst.mockResolvedValue({ id: 'course-1' });
      prisma.academicLoadGroup.findFirst.mockResolvedValue({ id: 'group-1' });
      prisma.user.findFirst.mockResolvedValue({ id: 'prof-1' });
      prisma.academicLoad.findFirst.mockResolvedValue(null);
      prisma.academicLoad.create.mockResolvedValue({ id: 'al-new' });
    };

    it('debe registrar error para campos obligatorios faltantes', async () => {
      const result = await service.bulkImportAcademicLoads([{} as any]);
      expect(result.errors).toBe(1);
      expect(result.errorDetails[0]).toContain('Datos incompletos');
    });

    it('debe registrar error si campus no se encuentra', async () => {
      prisma.campus.findFirst.mockResolvedValue(null);
      const result = await service.bulkImportAcademicLoads([loadValido]);
      expect(result.errors).toBe(1);
      expect(result.errorDetails[0]).toContain('Campus');
    });

    it('debe registrar error si ciclo académico no se encuentra', async () => {
      prisma.campus.findFirst.mockResolvedValue({ id: 'campus-1' });
      prisma.academicCycle.findFirst.mockResolvedValue(null);
      const result = await service.bulkImportAcademicLoads([loadValido]);
      expect(result.errors).toBe(1);
      expect(result.errorDetails[0]).toContain('Ciclo');
    });

    it('debe registrar error si curso no se encuentra', async () => {
      prisma.campus.findFirst.mockResolvedValue({ id: 'campus-1' });
      prisma.academicCycle.findFirst.mockResolvedValue({ id: 'cycle-1' });
      prisma.course.findFirst.mockResolvedValue(null);
      const result = await service.bulkImportAcademicLoads([loadValido]);
      expect(result.errors).toBe(1);
      expect(result.errorDetails[0]).toContain('Curso');
    });

    it('debe crear grupo si no existe y contabilizarlo en stats', async () => {
      prisma.campus.findFirst.mockResolvedValue({ id: 'campus-1' });
      prisma.academicCycle.findFirst.mockResolvedValue({ id: 'cycle-1' });
      prisma.course.findFirst.mockResolvedValue({ id: 'course-1' });
      prisma.academicLoadGroup.findFirst.mockResolvedValue(null);
      prisma.academicLoadGroup.create.mockResolvedValue({ id: 'grp-new' });
      prisma.user.findFirst.mockResolvedValue({ id: 'prof-1' });
      prisma.academicLoad.findFirst.mockResolvedValue(null);
      prisma.academicLoad.create.mockResolvedValue({ id: 'al-new' });

      const result = await service.bulkImportAcademicLoads([loadValido]);
      expect(result.created).toBe(1);
      expect(result.stats.groupsFound).toBe(1);
    });

    it('debe registrar error si falla la creación del grupo', async () => {
      prisma.campus.findFirst.mockResolvedValue({ id: 'campus-1' });
      prisma.academicCycle.findFirst.mockResolvedValue({ id: 'cycle-1' });
      prisma.course.findFirst.mockResolvedValue({ id: 'course-1' });
      prisma.academicLoadGroup.findFirst.mockResolvedValue(null);
      prisma.academicLoadGroup.create.mockRejectedValue(new Error('Duplicate key'));

      const result = await service.bulkImportAcademicLoads([loadValido]);
      expect(result.errors).toBe(1);
      expect(result.errorDetails[0]).toContain('Error al crear grupo');
    });

    it('debe registrar error si profesor no se encuentra', async () => {
      prisma.campus.findFirst.mockResolvedValue({ id: 'campus-1' });
      prisma.academicCycle.findFirst.mockResolvedValue({ id: 'cycle-1' });
      prisma.course.findFirst.mockResolvedValue({ id: 'course-1' });
      prisma.academicLoadGroup.findFirst.mockResolvedValue({ id: 'grp-1' });
      prisma.user.findFirst.mockResolvedValue(null);
      const result = await service.bulkImportAcademicLoads([loadValido]);
      expect(result.errors).toBe(1);
      expect(result.errorDetails[0]).toContain('Profesor');
    });

    it('debe reutilizar schedule existente', async () => {
      setupHappyPath();
      prisma.schedule.findFirst.mockResolvedValue({ id: 'sch-existing' });

      const result = await service.bulkImportAcademicLoads([{ ...loadValido, horario: 'L-K 8:00-10:00' }]);
      expect(result.created).toBe(1);
      expect(result.stats.schedulesCreated).toBe(0);
    });

    it('debe crear schedule si no existe', async () => {
      setupHappyPath();
      prisma.schedule.findFirst.mockResolvedValue(null);
      prisma.schedule.create.mockResolvedValue({ id: 'sch-new' });

      const result = await service.bulkImportAcademicLoads([{ ...loadValido, horario: 'L-K 8:00-10:00' }]);
      expect(result.created).toBe(1);
      expect(result.stats.schedulesCreated).toBe(1);
    });

    it('debe omitir scheduleId si horario está vacío', async () => {
      setupHappyPath();
      const result = await service.bulkImportAcademicLoads([{ ...loadValido, horario: '' }]);
      expect(result.created).toBe(1);
      expect(prisma.schedule.findFirst).not.toHaveBeenCalled();
    });

    it('debe buscar classroom si numeroAula se proporciona', async () => {
      setupHappyPath();
      prisma.classroom.findFirst.mockResolvedValue({ id: 'cl-1' });
      const result = await service.bulkImportAcademicLoads([{ ...loadValido, numeroAula: 'A-101' }]);
      expect(result.created).toBe(1);
      expect(prisma.classroom.findFirst).toHaveBeenCalled();
    });

    it('debe continuar sin classroom si no se encuentra', async () => {
      setupHappyPath();
      prisma.classroom.findFirst.mockResolvedValue(null);
      const result = await service.bulkImportAcademicLoads([{ ...loadValido, numeroAula: 'ZZZ-999' }]);
      expect(result.created).toBe(1);
    });

    it('debe actualizar carga existente por NRC', async () => {
      setupHappyPath();
      prisma.academicLoad.findFirst.mockResolvedValue({ id: 'al-existing' });
      prisma.academicLoad.update.mockResolvedValue({ id: 'al-existing' });

      const result = await service.bulkImportAcademicLoads([loadValido]);
      expect(result.updated).toBe(1);
      expect(result.created).toBe(0);
      expect(result.loadIds).toContain('al-existing');
    });

    it('debe crear nueva carga si NRC no existe', async () => {
      setupHappyPath();
      const result = await service.bulkImportAcademicLoads([loadValido]);
      expect(result.created).toBe(1);
      expect(result.loadIds).toContain('al-new');
    });

    it('debe capturar errores inesperados de BD', async () => {
      prisma.campus.findFirst.mockRejectedValue(new Error('Connection refused'));
      const result = await service.bulkImportAcademicLoads([loadValido]);
      expect(result.errors).toBe(1);
    });

    it('debe procesar múltiples cargas y acumular stats', async () => {
      setupHappyPath();
      prisma.academicLoad.create
        .mockResolvedValueOnce({ id: 'al-1' })
        .mockResolvedValueOnce({ id: 'al-2' });

      const result = await service.bulkImportAcademicLoads([
        loadValido,
        { ...loadValido, nrc: 'NRC-101' },
      ]);
      expect(result.created).toBe(2);
      expect(result.stats.coursesFound).toBe(2);
    });
  });
});
