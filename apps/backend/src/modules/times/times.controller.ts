import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Times')
@Controller('times')
export class TimesController {
  @Get('health')
  @ApiOperation({ summary: 'Verifica que el módulo de tiempos está activo' })
  health() {
    return { status: 'ok', module: 'times' };
  }
}
