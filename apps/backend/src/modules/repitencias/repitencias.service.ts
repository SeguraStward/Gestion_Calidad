import { Injectable, Logger } from '@nestjs/common';
import { RepitenciasRepository } from './repitencias.repository';
import { CreateRepitenciaDto } from './dtos/create-repitencia.dto';
import { UpdateRepitenciaDto } from './dtos/update-repitencia.dto';

@Injectable()
export class RepitenciasService {
  private readonly logger = new Logger(RepitenciasService.name);

  constructor(private readonly repo: RepitenciasRepository) {}

  async create(dto: CreateRepitenciaDto) {
    this.logger.log(`Creando repitencia para curso: ${dto.courseCode}`);
    return this.repo.save(dto as any);
  }

  async findAll(page?: number, limit?: number) {
    return this.repo.findAll(page, limit);
  }

  async findById(id: string) {
    return this.repo.findById(id);
  }

  async update(id: string, dto: UpdateRepitenciaDto) {
    this.logger.log(`Actualizando repitencia ${id}`);
    return this.repo.update(id, dto as any);
  }

  async delete(id: string) {
    this.logger.log(`Eliminando repitencia ${id}`);
    return this.repo.deleteById(id);
  }

  async findByCampus(campusId: string) {
    return this.repo.findByCampus(campusId);
  }

  async findByCourse(courseId: string) {
    return this.repo.findByCourse(courseId);
  }

  async findByAcademicCycle(academicCycleId: string) {
    return this.repo.findByAcademicCycle(academicCycleId);
  }

  async findByCampusAllocation(campusAllocationId: string) {
    return this.repo.findByCampusAllocation(campusAllocationId);
  }

  async calculateTotalAdditionalHours(campusAllocationId: string) {
    const total = await this.repo.calculateTotalAdditionalHours(campusAllocationId);
    return { total };
  }

  async getStatistics() {
    return this.repo.getStatistics();
  }
}
