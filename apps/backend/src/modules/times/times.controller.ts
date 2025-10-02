import { Controller, Get, Post, Body } from '@nestjs/common';
import { TimesService } from './times.service';
import { CreateTimeDto } from './dtos/create-time.dto';

@Controller('times')
export class TimesController {
  constructor(private readonly timesService: TimesService) {}

  // Endpoint de prueba para verificar que el módulo funciona
  @Get('ping')
  ping() {
    return { message: 'Times module alive 🚀' };
  }

  // Devuelve datos dummy de asignaciones de campus (para Postman / frontend)
  @Get('mock-campus')
  getMockCampusAllocations() {
    return this.timesService.getMockCampusAllocations();
  }

  // Ejemplo de POST usando DTO
  @Post()
  createTime(@Body() dto: CreateTimeDto) {
    return this.timesService.createTime(dto);
  }
}
