import { Injectable } from '@nestjs/common';
import { ExternalProvidersRepository } from './external-providers.repository';
import { CreateExternalProviderDto } from './dtos/create-external-provider.dto';
import { UpdateExternalProviderDto } from './dtos/update-external-provider.dto';

@Injectable()
export class ExternalProvidersService {
  constructor(private readonly repo: ExternalProvidersRepository) {}

  async create(dto: CreateExternalProviderDto) {
    // 🔄 Transformar el DTO para Prisma con la estructura de conexión correcta
    const { annualAllocationId, startDate, endDate, ...rest } = dto;

    console.log('🔍 Service - Original DTO:', JSON.stringify(dto, null, 2));
    console.log('🔍 Service - annualAllocationId:', annualAllocationId);

    // 📅 Transformar fechas string a DateTime ISO-8601
    const prismaData: any = {
      ...rest,
      annualAllocation: {
        connect: { id: annualAllocationId },
      },
    };

    // Solo agregar fechas si existen, convirtiéndolas a ISO-8601
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

  async update(id: string, dto: UpdateExternalProviderDto) {
    return this.repo.update(id, dto as any);
  }

  async delete(id: string) {
    return this.repo.deleteById(id);
  }

  async findByAnnualAllocation(annualAllocationId: string) {
    return this.repo.findByAnnualAllocation(annualAllocationId);
  }

  async calculateTotalProvidedTime(annualAllocationId: string) {
    const total = await this.repo.calculateTotalProvidedTime(annualAllocationId);
    return { total };
  }
}
