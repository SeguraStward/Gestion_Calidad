import { Injectable, Logger } from '@nestjs/common';
import { CohortsRepository } from './cohorts.repository';
import { CreateCohortDto } from './dtos/create-cohort.dto';
import { UpdateCohortDto } from './dtos/update-cohort.dto';

@Injectable()
export class CohortsService {
  private readonly logger = new Logger(CohortsService.name);

  constructor(private readonly repo: CohortsRepository) {}

  async create(dto: CreateCohortDto) {
    this.logger.log(`Creando cohorte ${dto.year}-${dto.group} para carrera ${dto.careerId}`);
    return this.repo.save({
      careerId: dto.careerId,
      year: dto.year,
      group: dto.group,
      initialStudents: dto.initialStudents,
      status: dto.status ?? 'ACTIVE',
    } as any);
  }

  async findAll() {
    return this.repo.findAllWithCareer();
  }

  async findByCareer(careerId: string) {
    return this.repo.findByCareer(careerId);
  }

  async findById(id: string) {
    return this.repo.findById(id);
  }

  async update(id: string, dto: UpdateCohortDto) {
    this.logger.log(`Actualizando cohorte ${id}`);
    return this.repo.update(id, dto as any);
  }

  async delete(id: string) {
    this.logger.log(`Eliminando cohorte ${id}`);
    return this.repo.deleteById(id);
  }
}
