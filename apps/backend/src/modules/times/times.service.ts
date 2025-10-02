import { Injectable } from '@nestjs/common';
import { TimesRepository } from './times.repository';
import { CreateTimeDto } from './dtos/create-time.dto';

@Injectable()
export class TimesService {
  constructor(private readonly timesRepository: TimesRepository) {}

  // Datos dummy para probar rápidamente
  getMockCampusAllocations() {
    return [
      {
        id: '1',
        campus: 'Sede Central',
        mesh: 'Malla 2021',
        cycle: '2025-I',
        allocatedTime: 200,
        baseTimeConsumed: 50,
        additionalTime: 10,
        availableTime: 140,
        status: 'APPROVED',
      },
      {
        id: '2',
        campus: 'Sede Brunca',
        mesh: 'Malla 2023',
        cycle: '2025-I',
        allocatedTime: 150,
        baseTimeConsumed: 70,
        additionalTime: 20,
        availableTime: 60,
        status: 'DRAFT',
      },
    ];
  }

  async createTime(dto: CreateTimeDto) {
    // Aquí podríamos guardar en la BD, de momento devolvemos mock
    return this.timesRepository.create(dto);
  }
}
