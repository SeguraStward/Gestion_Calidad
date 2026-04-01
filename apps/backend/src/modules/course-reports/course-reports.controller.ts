import { Body, Controller, Delete, Get, Logger, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CourseReportsService } from './course-reports.service';
import { CreateCourseReportDto } from './dtos/create-course-report.dto';
import { UpdateCourseReportDto } from './dtos/update-course-report.dto';

@ApiTags('Informes de Curso')
@Controller('course-reports')
export class CourseReportsController {
  private readonly logger = new Logger(CourseReportsController.name);

  constructor(private readonly service: CourseReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear informe de curso' })
  @ApiResponse({ status: 201, description: 'Informe creado exitosamente' })
  create(@Body() dto: CreateCourseReportDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los informes' })
  findAll() {
    return this.service.findAll();
  }

  @Get('by-campus/:campusId')
  @ApiOperation({ summary: 'Obtener informes por campus' })
  @ApiParam({ name: 'campusId', type: String })
  findByCampus(@Param('campusId') campusId: string) {
    return this.service.findByCampus(campusId);
  }

  @Get('projections/:campusId/:cycleId')
  @ApiOperation({ summary: 'Proyección de rezagados por curso (últimos 2 años)' })
  @ApiParam({ name: 'campusId', type: String })
  @ApiParam({ name: 'cycleId', type: String })
  getProjections(@Param('campusId') campusId: string, @Param('cycleId') cycleId: string) {
    return this.service.getProjections(campusId, cycleId);
  }

  @Get('alerts/:campusId')
  @ApiOperation({ summary: 'Cursos con 20+ rezagados proyectados (alertas para Erick)' })
  @ApiParam({ name: 'campusId', type: String })
  getAlerts(@Param('campusId') campusId: string) {
    return this.service.getAlerts(campusId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener informe por ID' })
  @ApiParam({ name: 'id', type: String })
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar informe' })
  @ApiParam({ name: 'id', type: String })
  update(@Param('id') id: string, @Body() dto: UpdateCourseReportDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar informe' })
  @ApiParam({ name: 'id', type: String })
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
