import { Injectable, Logger } from '@nestjs/common';
import { plainToClass } from 'class-transformer';

import { CareerDto } from './dtos/career.dto';
import { Career, Prisma } from '@una-gc/database/prisma/generated/client';
import { CareersRepository } from './careers.repository';

@Injectable()
export class CareersService {
  protected readonly logger = new Logger(CareersService.name);

  constructor(
    protected readonly careersRepository: CareersRepository,
  ) {}

  async findAll(page = 1, limit = 10, where?: any, orderBy?: any, include?: any) {
    try {
      const result = await this.careersRepository.findAll(page, limit, where, orderBy, include);
      return {
        data: result.data.map(career => plainToClass(CareerDto, career, { excludeExtraneousValues: true })),
        meta: result.meta,
      };
    } catch (error: any) {
      this.logger.error(`Error finding careers: ${error?.message}`, error?.stack);
      throw error;
    }
  }

  async findById(id: string, include?: any): Promise<CareerDto> {
    try {
      const career = await this.careersRepository.findById(id, include);
      return plainToClass(CareerDto, career, { excludeExtraneousValues: true });
    } catch (error: any) {
      this.logger.error(`Error finding career by id ${id}: ${error?.message}`, error?.stack);
      throw error;
    }
  }

  async create(dto: CareerDto): Promise<CareerDto> {
    this.logger.debug(`Creating career with data: ${JSON.stringify(dto)}`);
    
    // Transform the DTO to Prisma input format
    const createInput: Prisma.CareerCreateInput = {
      code: dto.code,
      name: dto.name,
      status: dto.status,
      school: {
        connect: { id: dto.schoolId }
      }
    };
    
    this.logger.debug(`Transformed create input: ${JSON.stringify(createInput)}`);
    
    try {
      const created = await this.careersRepository.save(createInput) as Career;
      this.logger.debug(`Created career: ${JSON.stringify(created)}`);
      return plainToClass(CareerDto, created, { excludeExtraneousValues: true });
    } catch (error: any) {
      this.logger.error(`Error creating career: ${error?.message}`, error?.stack);
      throw error;
    }
  }

  async update(id: string, dto: Partial<CareerDto>): Promise<CareerDto> {
    this.logger.debug(`Updating career ${id} with data: ${JSON.stringify(dto)}`);
    
    // Transform the DTO to Prisma input format
    const updateInput: Prisma.CareerUpdateInput = {
      ...(dto.code && { code: dto.code }),
      ...(dto.name && { name: dto.name }),
      ...(dto.status && { status: dto.status }),
      ...(dto.schoolId && { 
        school: {
          connect: { id: dto.schoolId }
        }
      })
    };
    
    this.logger.debug(`Transformed update input: ${JSON.stringify(updateInput)}`);
    
    try {
      const updated = await this.careersRepository.update(id, updateInput);
      this.logger.debug(`Updated career: ${JSON.stringify(updated)}`);
      return plainToClass(CareerDto, updated, { excludeExtraneousValues: true });
    } catch (error: any) {
      this.logger.error(`Error updating career: ${error?.message}`, error?.stack);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.careersRepository.delete(id);
      this.logger.debug(`Deleted career with id: ${id}`);
    } catch (error: any) {
      this.logger.error(`Error deleting career: ${error?.message}`, error?.stack);
      throw error;
    }
  }
}
