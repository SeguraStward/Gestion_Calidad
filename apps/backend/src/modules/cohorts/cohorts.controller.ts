import { Body, Controller, Delete, Get, Logger, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CohortsService } from './cohorts.service';
import { CreateCohortDto } from './dtos/create-cohort.dto';
import { UpdateCohortDto } from './dtos/update-cohort.dto';

@ApiTags('Cohortes')
@Controller('cohorts')
export class CohortsController {
  private readonly logger = new Logger(CohortsController.name);

  constructor(private readonly service: CohortsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear cohorte' })
  @ApiResponse({ status: 201, description: 'Cohorte creado exitosamente' })
  create(@Body() dto: CreateCohortDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los cohortes' })
  findAll() {
    return this.service.findAll();
  }

  @Get('by-career/:careerId')
  @ApiOperation({ summary: 'Obtener cohortes por carrera' })
  @ApiParam({ name: 'careerId', type: String })
  findByCareer(@Param('careerId') careerId: string) {
    return this.service.findByCareer(careerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener cohorte por ID' })
  @ApiParam({ name: 'id', type: String })
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar cohorte' })
  @ApiParam({ name: 'id', type: String })
  update(@Param('id') id: string, @Body() dto: UpdateCohortDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar cohorte' })
  @ApiParam({ name: 'id', type: String })
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
