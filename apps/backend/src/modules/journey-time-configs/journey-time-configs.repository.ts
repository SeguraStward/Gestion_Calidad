import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateJourneyTimeConfigDto } from './dtos/create-journey-time-config.dto';
import { UpdateJourneyTimeConfigDto } from './dtos/update-journey-time-config.dto';

@Injectable()
export class JourneyTimeConfigsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateJourneyTimeConfigDto) {
    return this.prisma.journeyTimeCalculationConfig.create({ data: dto });
  }

  async findAll() {
    return this.prisma.journeyTimeCalculationConfig.findMany();
  }

  async findActive() {
    return this.prisma.journeyTimeCalculationConfig.findFirst({ where: { isActive: true } });
  }

  async update(id: string, dto: UpdateJourneyTimeConfigDto) {
    return this.prisma.journeyTimeCalculationConfig.update({ where: { id }, data: dto });
  }

  async delete(id: string) {
    return this.prisma.journeyTimeCalculationConfig.delete({ where: { id } });
  }
}
