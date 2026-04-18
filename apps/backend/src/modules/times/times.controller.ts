import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TimesService } from './times.service';

@ApiTags('Times')
@Controller('times')
export class TimesController {
  constructor(private readonly timesService: TimesService) {}

  @Get('health')
  @ApiOperation({ summary: 'Verifica que el módulo de tiempos está activo' })
  health() {
    return { status: 'ok', module: 'times' };
  }

  /**
   * Resumen de jornadas consumidas por carrera y ciclo para un año.
   * Formato: carrera | Ciclo I | Ciclo II | Repitencia | Total año
   * Tal como lo lee Erick en su Excel.
   */
  @Get('career-summary')
  @ApiOperation({ summary: 'Jornadas consumidas por carrera y ciclo (estilo Excel Erick)' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  async getCareerSummary(@Query('year') year?: string) {
    const y = year ? Number(year) : new Date().getFullYear();
    return this.timesService.getCareerSummary(y);
  }

  /**
   * Balance anual: disponibles vs consumidos vs saldo.
   * Los tres números que Erick necesita para saber cuántos tiempos le faltan pedir.
   */
  @Get('annual-balance')
  @ApiOperation({ summary: 'Balance anual de jornadas: disponibles vs consumidos vs saldo' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  async getAnnualBalance(@Query('year') year?: string) {
    const y = year ? Number(year) : new Date().getFullYear();
    return this.timesService.getAnnualBalance(y);
  }
}
