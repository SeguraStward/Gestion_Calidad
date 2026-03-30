import { Injectable } from '@nestjs/common';

import { ExternalProvidersRepository } from './external-providers.repository';
import { CreateExternalProviderDto } from './dtos/create-external-provider.dto';
import { UpdateExternalProviderDto } from './dtos/update-external-provider.dto';

@Injectable()
export class ExternalProvidersService {
  constructor(private readonly repo: ExternalProvidersRepository) {}

  async create(dto: CreateExternalProviderDto) {
    const { annualAllocationId, startDate, endDate, ...rest } = dto;

    const prismaData: any = {
      ...rest,
      annualAllocation: {
        connect: { id: annualAllocationId },
      },
    };

    if (startDate) {
      prismaData.startDate = new Date(startDate).toISOString();
    }

    if (endDate) {
      prismaData.endDate = new Date(endDate).toISOString();
    }

    return this.repo.save(prismaData as any);
  }

  async findAll(page?: number, limit?: number) {
    return this.repo.findAll(page, limit);
  }

  async findById(id: string) {
    return this.repo.findById(id);
  }

  async update(id: string, dto: UpdateExternalProviderDto) {
    const { annualAllocationId, startDate, endDate, ...rest } = dto;

    const prismaData: any = {
      ...rest,
    };

    if (annualAllocationId) {
      prismaData.annualAllocation = {
        connect: { id: annualAllocationId },
      };
    }

    if (startDate) {
      prismaData.startDate = new Date(startDate).toISOString();
    }

    if (endDate) {
      prismaData.endDate = new Date(endDate).toISOString();
    }

    return this.repo.update(id, prismaData as any);
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
