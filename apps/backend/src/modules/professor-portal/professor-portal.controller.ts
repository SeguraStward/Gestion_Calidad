import { Body, Controller, Get, Logger, Post, Request, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ProfessorPortalService } from './professor-portal.service';
import { ProfessorPortalGuard } from './guards/professor-portal.guard';
import { GenerateTokenDto } from './dtos/generate-token.dto';
import { PortalAccessDto } from './dtos/portal-access.dto';
import { SubmitReportDto } from './dtos/submit-report.dto';

@ApiTags('Portal del Profesor')
@Controller('professor-portal')
export class ProfessorPortalController {
  private readonly logger = new Logger(ProfessorPortalController.name);

  constructor(private readonly service: ProfessorPortalService) {}

  @Post('generate-token')
  @ApiOperation({ summary: 'Erick genera un token de acceso para un profesor' })
  @ApiResponse({ status: 201, description: 'Token generado exitosamente' })
  generateToken(@Body() dto: GenerateTokenDto) {
    return this.service.generateToken(dto);
  }

  @Post('access')
  @ApiOperation({ summary: 'El profesor entra con cédula + token' })
  @ApiResponse({ status: 200, description: 'Acceso concedido, devuelve info de sesión' })
  access(@Body() dto: PortalAccessDto) {
    return this.service.access(dto);
  }

  @Get('my-courses')
  @UseGuards(ProfessorPortalGuard)
  @ApiOperation({ summary: 'Lista los cursos asignados al profesor en el ciclo activo' })
  @ApiHeader({ name: 'x-professor-token', required: true })
  @ApiHeader({ name: 'x-professor-cedula', required: true })
  getMyCourses(@Request() req: any) {
    const { cedula, campusId, academicCycleId } = req.portalToken;
    return this.service.getMyCourses(cedula, campusId, academicCycleId);
  }

  @Post('submit-report')
  @UseGuards(ProfessorPortalGuard)
  @ApiOperation({ summary: 'El profesor envía su informe de un curso' })
  @ApiHeader({ name: 'x-professor-token', required: true })
  @ApiHeader({ name: 'x-professor-cedula', required: true })
  submitReport(@Request() req: any, @Body() dto: SubmitReportDto) {
    const { cedula, campusId, academicCycleId, token } = req.portalToken;
    return this.service.submitReport(cedula, campusId, academicCycleId, token, dto);
  }
}
