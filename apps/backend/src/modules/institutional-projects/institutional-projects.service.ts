import { Injectable } from '@nestjs/common';
import { InstitutionalProjectsRepository } from './institutional-projects.repository';
import { CreateInstitutionalProjectDto } from './dtos/create-institutional-project.dto';
import { UpdateInstitutionalProjectDto } from './dtos/update-institutional-project.dto';

@Injectable()
export class InstitutionalProjectsService {
  constructor(private readonly repo: InstitutionalProjectsRepository) {}

  async create(dto: CreateInstitutionalProjectDto) {
    // 🔄 Transformar el DTO para Prisma con las estructuras de conexión correctas
    const { campusAllocationId, directorId, startDate, endDate, ...rest } = dto;

    console.log('🔍 Service - Original DTO:', JSON.stringify(dto, null, 2));
    console.log('🔍 Service - campusAllocationId:', campusAllocationId);
    console.log('🔍 Service - directorId:', directorId);

    // 📅 Transformar fechas string a DateTime ISO-8601
    const prismaData: any = {
      ...rest,
      campusAllocation: {
        connect: { id: campusAllocationId },
      },
      director: {
        connect: { id: directorId },
      },
    };

    // Convertir fechas a ISO-8601
    if (startDate) {
      prismaData.startDate = new Date(startDate).toISOString();
    }
    if (endDate) {
      prismaData.endDate = new Date(endDate).toISOString();
    }

    console.log('🔍 Service - Transformed Prisma Data:', JSON.stringify(prismaData, null, 2));

    try {
      const result = await this.repo.save(prismaData as any);
      console.log('✅ Service - Saved successfully:', Array.isArray(result) ? 'bulk' : (result as any)?.id);
      return result;
    } catch (error: any) {
      console.error('❌ Service - Error saving:', error?.message || error);
      throw error;
    }
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
