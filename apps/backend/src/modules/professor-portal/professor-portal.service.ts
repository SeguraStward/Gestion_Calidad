import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { randomUUID } from 'crypto';

import { GenerateTokenDto } from './dtos/generate-token.dto';
import { PortalAccessDto } from './dtos/portal-access.dto';
import { SubmitReportDto } from './dtos/submit-report.dto';

@Injectable()
export class ProfessorPortalService {
  private readonly logger = new Logger(ProfessorPortalService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Erick genera un token para que un profesor acceda al portal.
   */
  async generateToken(dto: GenerateTokenDto) {
    this.logger.log(`Generando token de portal para cédula ${dto.cedula}`);

    // Invalidar tokens anteriores activos para esta cédula+campus+ciclo
    await this.prisma.professorPortalToken.updateMany({
      where: {
        cedula: dto.cedula,
        campusId: dto.campusId,
        academicCycleId: dto.academicCycleId,
        status: 'ACTIVE',
      },
      data: { status: 'EXPIRED' },
    });

    const token = randomUUID();

    return this.prisma.professorPortalToken.create({
      data: {
        cedula: dto.cedula,
        token,
        campusId: dto.campusId,
        academicCycleId: dto.academicCycleId,
        expiresAt: new Date(dto.expiresAt),
        status: 'ACTIVE',
      },
    });
  }

  /**
   * El profesor ingresa con cédula + token.
   * Devuelve información de sesión con sus datos de la asignación.
   */
  async access(dto: PortalAccessDto) {
    const portalToken = await this.prisma.professorPortalToken.findUnique({
      where: { token: dto.token },
    });

    if (!portalToken || portalToken.cedula !== dto.cedula) {
      throw new UnauthorizedException('Cédula o token inválidos');
    }

    if (portalToken.status !== 'ACTIVE') {
      throw new UnauthorizedException('Token expirado o ya utilizado');
    }

    if (new Date() > portalToken.expiresAt) {
      await this.prisma.professorPortalToken.update({
        where: { token: dto.token },
        data: { status: 'EXPIRED' },
      });
      throw new UnauthorizedException('Token expirado');
    }

    // Buscar el User por nationalId (cédula)
    const professor = await this.prisma.user.findFirst({
      where: { nationalId: dto.cedula },
      select: { id: true, fullName: true, nationalId: true },
    });

    return {
      token: dto.token,
      cedula: dto.cedula,
      campusId: portalToken.campusId,
      academicCycleId: portalToken.academicCycleId,
      professor: professor ?? { id: null, fullName: dto.cedula, nationalId: dto.cedula },
    };
  }

  /**
   * Lista los cursos asignados al profesor en el ciclo del token.
   * portalToken viene adjunto por el guard.
   */
  async getMyCourses(cedula: string, campusId: string, academicCycleId: string) {
    const professor = await this.prisma.user.findFirst({
      where: { nationalId: cedula },
      select: { id: true },
    });

    if (!professor) {
      // Si el profesor no tiene cuenta, devolver lista vacía
      return [];
    }

    return this.prisma.professorAssignment.findMany({
      where: {
        professorId: professor.id,
        campusId,
        academicCycleId,
      },
      include: {
        curricularMeshCourse: { include: { course: { select: { id: true, name: true, code: true } } } },
        academicCycle: { select: { name: true, year: true } },
        campus: { select: { name: true } },
      },
    });
  }

  /**
   * El profesor envía su informe de un curso.
   * Se marca el token como USED al enviar el informe final.
   */
  async submitReport(
    cedula: string,
    campusId: string,
    academicCycleId: string,
    tokenStr: string,
    dto: SubmitReportDto,
  ) {
    if (dto.aprobados + dto.reprobados > dto.matriculados) {
      throw new BadRequestException('Aprobados + reprobados no puede superar matriculados');
    }

    const professor = await this.prisma.user.findFirst({
      where: { nationalId: cedula },
      select: { id: true },
    });

    if (!professor) {
      throw new NotFoundException(`No se encontró un usuario con cédula ${cedula}`);
    }

    const report = await this.prisma.courseReport.upsert({
      where: {
        unique_course_report_per_submission_type: {
          courseId: dto.courseId,
          academicCycleId,
          campusId,
          professorId: professor.id,
          isFinal: dto.isFinal ?? false,
        },
      },
      create: {
        courseId: dto.courseId,
        academicCycleId,
        campusId,
        professorId: professor.id,
        matriculados: dto.matriculados,
        aprobados: dto.aprobados,
        reprobados: dto.reprobados,
        isFinal: dto.isFinal ?? false,
        status: 'SUBMITTED',
      },
      update: {
        matriculados: dto.matriculados,
        aprobados: dto.aprobados,
        reprobados: dto.reprobados,
        isFinal: dto.isFinal ?? false,
        status: 'SUBMITTED',
      },
    });

    // Marcar token como USED solo si es informe final
    if (dto.isFinal) {
      await this.prisma.professorPortalToken.update({
        where: { token: tokenStr },
        data: { status: 'USED', usedAt: new Date() },
      });
    }

    return report;
  }
}
