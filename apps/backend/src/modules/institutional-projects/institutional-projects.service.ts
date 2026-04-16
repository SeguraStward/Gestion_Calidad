import { Injectable } from '@nestjs/common';

import { InstitutionalProjectsRepository } from './institutional-projects.repository';
import { CreateInstitutionalProjectDto } from './dtos/create-institutional-project.dto';
import { UpdateInstitutionalProjectDto } from './dtos/update-institutional-project.dto';

@Injectable()
export class InstitutionalProjectsService {
  constructor(private readonly repo: InstitutionalProjectsRepository) {}

  async create(dto: CreateInstitutionalProjectDto) {
    const { campusAllocationId, directorId, startDate, endDate, ...rest } = dto;

    const prismaData: any = {
      ...rest,
      campusAllocation: {
        connect: { id: campusAllocationId },
      },
      director: {
        connect: { id: directorId },
      },
    };

    if (startDate) {
      prismaData.startDate = new Date(startDate).toISOString();
    }

    if (endDate) {
      prismaData.endDate = new Date(endDate).toISOString();
    }

    const created: any = await this.repo.save(prismaData as any);
    return this.repo.findByIdWithDirector(created.id);
  }

  async findAll() {
    return this.repo.findAllActive();
  }

  async findById(id: string) {
    return this.repo.findById(id);
  }

  async update(id: string, dto: UpdateInstitutionalProjectDto) {
    const { campusAllocationId, directorId, startDate, endDate, ...rest } = dto;

    const prismaData: any = {
      ...rest,
    };

    if (campusAllocationId) {
      prismaData.campusAllocation = {
        connect: { id: campusAllocationId },
      };
    }

    if (directorId) {
      prismaData.director = {
        connect: { id: directorId },
      };
    }

    if (startDate) {
      prismaData.startDate = new Date(startDate).toISOString();
    }

    if (endDate) {
      prismaData.endDate = new Date(endDate).toISOString();
    }

    await this.repo.update(id, prismaData as any);
    return this.repo.findByIdWithDirector(id);
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
