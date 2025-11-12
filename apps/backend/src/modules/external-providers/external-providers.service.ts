import { Injectable } from '@nestjs/common';
import { ExternalProvidersRepository } from './external-providers.repository';
import { CreateExternalProviderDto } from './dtos/create-external-provider.dto';
import { UpdateExternalProviderDto } from './dtos/update-external-provider.dto';

@Injectable()
export class ExternalProvidersService {
  constructor(private readonly repo: ExternalProvidersRepository) {}

  async create(dto: CreateExternalProviderDto) {
    return this.repo.save(dto as any);
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
