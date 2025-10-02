import { Body, Controller, Get, Param, Post, Put, Delete, Query } from '@nestjs/common';
import { JourneyTimeConfigsService } from './journey-time-configs.service';
import { CreateJourneyTimeConfigDto } from './dtos/create-journey-time-config.dto';
import { UpdateJourneyTimeConfigDto } from './dtos/update-journey-time-config.dto';

@Controller('journey-time-configs')
export class JourneyTimeConfigsController {
  constructor(private readonly service: JourneyTimeConfigsService) {}

  @Post()
  create(@Body() dto: CreateJourneyTimeConfigDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('active')
  findActive() {
    return this.service.findActive();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateJourneyTimeConfigDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Get('calc')
  calculate(@Query('hours') hours: string) {
    const h = parseInt(hours, 10);
    return this.service.calculateJourneyTime(h);
  }
}
