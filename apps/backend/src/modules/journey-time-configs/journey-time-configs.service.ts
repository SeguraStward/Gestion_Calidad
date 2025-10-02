import { Injectable } from '@nestjs/common';
import { JourneyTimeConfigsRepository } from './journey-time-configs.repository';
import { CreateJourneyTimeConfigDto } from './dtos/create-journey-time-config.dto';
import { UpdateJourneyTimeConfigDto } from './dtos/update-journey-time-config.dto';

@Injectable()
export class JourneyTimeConfigsService {
  constructor(private readonly repo: JourneyTimeConfigsRepository) {}

  create(dto: CreateJourneyTimeConfigDto) {
    return this.repo.create(dto);
  }

  findAll() {
    return this.repo.findAll();
  }

  findActive() {
    return this.repo.findActive();
  }

  async update(id: string, dto: UpdateJourneyTimeConfigDto) {
    try {
      return await this.repo.update(id, dto);
    } catch (error) {
      console.error('❌ Prisma update error:', error);
      throw error;
    }
  }

  remove(id: string) {
    return this.repo.delete(id);
  }

  async calculateJourneyTime(hours: number) {
    const config = await this.repo.findActive();
    if (!config) throw new Error('No hay configuración activa');

    if (hours >= config.quarterTimeMinHours && hours <= config.quarterTimeMaxHours) {
      return { type: 'QUARTER', value: config.quarterTimeValue };
    }
    if (hours >= config.halfTimeMinHours && hours <= config.halfTimeMaxHours) {
      return { type: 'HALF', value: config.halfTimeValue };
    }
    if (hours >= config.threeQuarterMinHours && hours <= config.threeQuarterMaxHours) {
      return { type: 'THREE_QUARTER', value: config.threeQuarterTimeValue };
    }
    if (hours >= config.fullTimeMinHours) {
      return { type: 'FULL', value: config.fullTimeValue };
    }

    return { type: 'UNDEFINED', value: 0 };
  }
}
