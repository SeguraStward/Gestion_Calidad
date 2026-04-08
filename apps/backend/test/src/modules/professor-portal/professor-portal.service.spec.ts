/**
 * Pruebas unitarias — ProfessorPortalService
 *
 * Cubre:
 *  - generateToken  → invalida tokens previos y crea uno nuevo
 *  - access         → token no existe, cédula no coincide, token expirado (status), token expirado (fecha)
 *                     → acceso válido con profesor encontrado y sin profesor en BD
 *  - getMyCourses   → profesor no existe (lista vacía), profesor encontrado
 *  - submitReport   → validación aprobados+reprobados, profesor no encontrado, informe parcial, informe final
 */

import { BadRequestException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ProfessorPortalService } from '@modules/professor-portal/professor-portal.service';
import { PrismaService } from '@src/prisma/prisma.service';

// ─── Mock de crypto.randomUUID ────────────────────────────────────────────────
jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomUUID: jest.fn().mockReturnValue('uuid-mock-token'),
}));

// ─── Mock de Prisma ───────────────────────────────────────────────────────────

const mockPrisma = () => ({
  professorPortalToken: {
    updateMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  user: {
    findFirst: jest.fn(),
  },
  professorAssignment: {
    findMany: jest.fn(),
  },
  courseReport: {
    upsert: jest.fn(),
  },
});

// ─── Datos base ───────────────────────────────────────────────────────────────

const futureDate = new Date(Date.now() + 86400000); // +1 día

const tokenActivo = {
  id: 'token-1',
  token: 'uuid-mock-token',
  cedula: '123456',
  campusId: 'campus-1',
  academicCycleId: 'cycle-1',
  status: 'ACTIVE',
  expiresAt: futureDate,
};

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('ProfessorPortalService', () => {
  let service: ProfessorPortalService;
  let prisma: ReturnType<typeof mockPrisma>;

  beforeEach(() => {
    prisma = mockPrisma();
    service = new ProfessorPortalService(prisma as unknown as PrismaService);
    jest.spyOn(service['logger'] as Logger, 'log').mockImplementation(() => {});
    jest.spyOn(service['logger'] as Logger, 'error').mockImplementation(() => {});
    jest.spyOn(service['logger'] as Logger, 'warn').mockImplementation(() => {});
    jest.spyOn(service['logger'] as Logger, 'debug').mockImplementation(() => {});
  });

  // ── generateToken ─────────────────────────────────────────────────────────

  describe('generateToken', () => {
    it('debe invalidar tokens previos y crear uno nuevo', async () => {
      prisma.professorPortalToken.updateMany.mockResolvedValue({ count: 1 });
      prisma.professorPortalToken.create.mockResolvedValue(tokenActivo);

      const dto = {
        cedula: '123456',
        campusId: 'campus-1',
        academicCycleId: 'cycle-1',
        expiresAt: futureDate.toISOString(),
      };

      const result = await service.generateToken(dto as any);

      expect(prisma.professorPortalToken.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ cedula: '123456', status: 'ACTIVE' }),
          data: { status: 'EXPIRED' },
        }),
      );
      expect(prisma.professorPortalToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ token: 'uuid-mock-token', cedula: '123456' }),
        }),
      );
      expect(result).toMatchObject({ id: 'token-1' });
    });
  });

  // ── access ────────────────────────────────────────────────────────────────

  describe('access', () => {
    it('debe lanzar UnauthorizedException si el token no existe', async () => {
      prisma.professorPortalToken.findUnique.mockResolvedValue(null);
      await expect(service.access({ token: 'bad-token', cedula: '123456' } as any))
        .rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si la cédula no coincide', async () => {
      prisma.professorPortalToken.findUnique.mockResolvedValue({ ...tokenActivo, cedula: '999999' });
      await expect(service.access({ token: 'uuid-mock-token', cedula: '123456' } as any))
        .rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si el token no está ACTIVE', async () => {
      prisma.professorPortalToken.findUnique.mockResolvedValue({ ...tokenActivo, status: 'EXPIRED' });
      await expect(service.access({ token: 'uuid-mock-token', cedula: '123456' } as any))
        .rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si el token está vencido por fecha', async () => {
      const pastDate = new Date(Date.now() - 1000);
      prisma.professorPortalToken.findUnique.mockResolvedValue({ ...tokenActivo, expiresAt: pastDate });
      prisma.professorPortalToken.update.mockResolvedValue({});

      await expect(service.access({ token: 'uuid-mock-token', cedula: '123456' } as any))
        .rejects.toThrow(UnauthorizedException);

      expect(prisma.professorPortalToken.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'EXPIRED' } }),
      );
    });

    it('debe retornar sesión con datos del profesor si el usuario existe', async () => {
      prisma.professorPortalToken.findUnique.mockResolvedValue(tokenActivo);
      prisma.user.findFirst.mockResolvedValue({ id: 'user-1', fullName: 'Ana García', nationalId: '123456' });

      const result = await service.access({ token: 'uuid-mock-token', cedula: '123456' } as any);

      expect(result).toMatchObject({
        cedula: '123456',
        campusId: 'campus-1',
        professor: { id: 'user-1', fullName: 'Ana García' },
      });
    });

    it('debe retornar sesión con datos de fallback si el usuario no existe en BD', async () => {
      prisma.professorPortalToken.findUnique.mockResolvedValue(tokenActivo);
      prisma.user.findFirst.mockResolvedValue(null);

      const result = await service.access({ token: 'uuid-mock-token', cedula: '123456' } as any);

      expect(result.professor).toMatchObject({ id: null, nationalId: '123456' });
    });
  });

  // ── getMyCourses ──────────────────────────────────────────────────────────

  describe('getMyCourses', () => {
    it('debe retornar lista vacía si el profesor no tiene cuenta', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      const result = await service.getMyCourses('123456', 'campus-1', 'cycle-1');
      expect(result).toEqual([]);
      expect(prisma.professorAssignment.findMany).not.toHaveBeenCalled();
    });

    it('debe retornar asignaciones del profesor', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'user-1' });
      prisma.professorAssignment.findMany.mockResolvedValue([
        { id: 'assign-1', curricularMeshCourse: { course: { name: 'Cálculo' } } },
      ]);

      const result = await service.getMyCourses('123456', 'campus-1', 'cycle-1');

      expect(prisma.professorAssignment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { professorId: 'user-1', campusId: 'campus-1', academicCycleId: 'cycle-1' },
        }),
      );
      expect(result).toHaveLength(1);
    });
  });

  // ── submitReport ──────────────────────────────────────────────────────────

  describe('submitReport', () => {
    const reportDto = {
      courseId: 'course-1',
      matriculados: 30,
      aprobados: 25,
      reprobados: 5,
      isFinal: false,
    };

    it('debe lanzar BadRequestException si aprobados + reprobados > matriculados', async () => {
      await expect(
        service.submitReport('123456', 'campus-1', 'cycle-1', 'token-str', {
          ...reportDto,
          aprobados: 20,
          reprobados: 15, // 20+15=35 > 30
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar NotFoundException si el profesor no existe', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      await expect(
        service.submitReport('123456', 'campus-1', 'cycle-1', 'token-str', reportDto as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe crear/actualizar el informe parcial sin marcar token como USED', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'user-1' });
      prisma.courseReport.upsert.mockResolvedValue({ id: 'report-1', status: 'SUBMITTED' });

      const result = await service.submitReport('123456', 'campus-1', 'cycle-1', 'token-str', {
        ...reportDto,
        isFinal: false,
      } as any);

      expect(prisma.courseReport.upsert).toHaveBeenCalled();
      expect(prisma.professorPortalToken.update).not.toHaveBeenCalled();
      expect(result).toMatchObject({ id: 'report-1' });
    });

    it('debe marcar el token como USED al enviar informe final', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'user-1' });
      prisma.courseReport.upsert.mockResolvedValue({ id: 'report-final', status: 'SUBMITTED' });
      prisma.professorPortalToken.update.mockResolvedValue({});

      await service.submitReport('123456', 'campus-1', 'cycle-1', 'my-token', {
        ...reportDto,
        isFinal: true,
      } as any);

      expect(prisma.professorPortalToken.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { token: 'my-token' },
          data: expect.objectContaining({ status: 'USED' }),
        }),
      );
    });

    it('debe usar isFinal=false por defecto si no se especifica', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'user-1' });
      prisma.courseReport.upsert.mockResolvedValue({ id: 'report-1' });

      await service.submitReport('123456', 'campus-1', 'cycle-1', 'token-str', {
        ...reportDto,
        isFinal: undefined,
      } as any);

      const upsertCall = prisma.courseReport.upsert.mock.calls[0][0];
      expect(upsertCall.create.isFinal).toBe(false);
    });
  });
});
