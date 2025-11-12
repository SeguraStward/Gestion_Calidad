import { Injectable } from '@nestjs/common';
import { InstitutionalProjectsRepository } from './institutional-projects.repository';
import { CreateInstitutionalProjectDto } from './dtos/create-institutional-project.dto';
import { UpdateInstitutionalProjectDto } from './dtos/update-institutional-project.dto';

@Injectable()
export class InstitutionalProjectsService {
  constructor(private readonly repo: InstitutionalProjectsRepository) {}

  async create(dto: CreateInstitutionalProjectDto) {
    return this.repo.save(dto as any);
  }

  async findAll(page?: number, limit?: number) {
    return this.repo.findAll(page, limit);
  }

  async findById(id: string) {
    return this.repo.findById(id);
  }

  async update(id: string, dto: UpdateInstitutionalProjectDto) {
    return this.repo.update(id, dto as any);
  }

  async delete(id: string) {
    return this.repo.deleteById(id);
  }

  async findByCampusAllocation(campusAllocationId: string) {
    return this.repo.findByCampusAllocation(campusAllocationId);
  }

  async findByDirector(directorId: string) {
    return this.repo.findByDirector(directorId);
  }

  async calculateTotalAssignedTime(campusAllocationId: string) {
    const total = await this.repo.calculateTotalAssignedTime(campusAllocationId);
    return { total };
  }

  async findWithAvailableTime() {
    return this.repo.findWithAvailableTime();
  }
}
