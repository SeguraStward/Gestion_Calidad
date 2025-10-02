import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTimeDto } from './dtos/create-time.dto';

@Injectable()
export class TimesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTimeDto) {
    // Como aún no tenemos un modelo específico para "Times",
    // devolvemos un mock simulando inserción en BD
    return {
      id: 'mock-id',
      ...dto,
      createdAt: new Date(),
    };
  }
}
