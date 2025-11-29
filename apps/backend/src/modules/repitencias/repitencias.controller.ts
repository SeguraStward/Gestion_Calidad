import { Body, Controller, Delete, Get, Logger, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { RepitenciasService } from './repitencias.service';
import { CreateRepitenciaDto } from './dtos/create-repitencia.dto';
import { UpdateRepitenciaDto } from './dtos/update-repitencia.dto';

@ApiTags('Repitencias')
@Controller('repitencias')
export class RepitenciasController {
  private readonly logger = new Logger(RepitenciasController.name);

  constructor(private readonly service: RepitenciasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear repitencia' })
  @ApiResponse({ status: 201, description: 'Repitencia creada exitosamente' })
  create(@Body() dto: CreateRepitenciaDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las repitencias' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.service.findAll(page, limit);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Obtener estadísticas de repitencias' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas exitosamente' })
  getStatistics() {
    return this.service.getStatistics();
  }

  @Get('by-campus/:campusId')
  @ApiOperation({ summary: 'Obtener repitencias por campus' })
  @ApiParam({ name: 'campusId', type: String })
  findByCampus(@Param('campusId') campusId: string) {
    return this.service.findByCampus(campusId);
  }

  @Get('by-course/:courseId')
  @ApiOperation({ summary: 'Obtener repitencias por curso' })
  @ApiParam({ name: 'courseId', type: String })
  findByCourse(@Param('courseId') courseId: string) {
    return this.service.findByCourse(courseId);
  }

  @Get('by-academic-cycle/:academicCycleId')
  @ApiOperation({ summary: 'Obtener repitencias por ciclo académico' })
  @ApiParam({ name: 'academicCycleId', type: String })
  findByAcademicCycle(@Param('academicCycleId') academicCycleId: string) {
    return this.service.findByAcademicCycle(academicCycleId);
  }

  @Get('by-campus-allocation/:campusAllocationId')
  @ApiOperation({ summary: 'Obtener repitencias por asignación de campus' })
  @ApiParam({ name: 'campusAllocationId', type: String })
  findByCampusAllocation(@Param('campusAllocationId') campusAllocationId: string) {
    return this.service.findByCampusAllocation(campusAllocationId);
  }

  @Get('total-additional-hours/:campusAllocationId')
  @ApiOperation({ summary: 'Calcular total de horas adicionales por asignación de campus' })
  @ApiParam({ name: 'campusAllocationId', type: String })
  calculateTotalAdditionalHours(@Param('campusAllocationId') campusAllocationId: string) {
    return this.service.calculateTotalAdditionalHours(campusAllocationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener repitencia por ID' })
  @ApiParam({ name: 'id', type: String })
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar repitencia' })
  @ApiParam({ name: 'id', type: String })
  update(@Param('id') id: string, @Body() dto: UpdateRepitenciaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar repitencia' })
  @ApiParam({ name: 'id', type: String })
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
