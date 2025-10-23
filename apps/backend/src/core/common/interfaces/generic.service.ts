import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { DtoValidator } from '../dto-validator';
import type { GenericRepository } from './generic-repository.interface';
import { IGenericService } from './generic-service.interface';

@Injectable()
export abstract class GenericService<E extends Record<string, any>, D, C = any, U = any>
  implements IGenericService<D, C, U> {
  protected abstract logger: Logger;

  constructor(
    protected readonly repository: GenericRepository<E>,
    protected readonly dtoClass?: new (...args: any[]) => D,
    protected readonly dtoValidator?: DtoValidator,
  ) { }

  private transformDto(entity: E): D;
  private transformDto(entity: E[]): D[];
  private transformDto(entity: E | E[]): D | D[] {
    if (!this.dtoClass) {
      this.logger.warn(`dtoClass is not defined in ${this.constructor.name}, returning raw entity/entities.`);
      return entity as any;
    }

    if (Array.isArray(entity)) {
      return entity.map((e) => plainToClass(this.dtoClass!, e, { excludeExtraneousValues: true }));
    }
    return plainToClass(this.dtoClass!, entity, { excludeExtraneousValues: true });
  }

  async findAll(page = 1, limit = 10, where?: any, orderBy?: any, include?: any) {
    try {
      const result = await this.repository.findAll(page, limit, where, orderBy, include);
      return {
        data: this.transformDto(result.data),
        meta: result.meta,
      };
    } catch (error) {
      this.logger.error('Error fetching records', error);
      throw error;
    }
  }

  async findById(id: string, include?: any): Promise<D | null> {
    try {
      const entity = await this.repository.findById(id, include);
      if (!entity) {
        return null;
      }
      return this.transformDto(entity);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`Entity with id ${id} not found`);
      }
      this.logger.error(`Error in findById for id ${id}:`, error);
      throw error;
    }
  }

  async findOne(where: any, include?: any): Promise<D | null> {
    try {
      const entity = await this.repository.findOne(where, include);
      if (!entity) return null;
      return this.transformDto(entity);
    } catch (error) {
      this.logger.error(`Error finding entity with criteria: ${JSON.stringify(where)}`, error);
      throw error;
    }
  }

  async count(where?: any) {
    return this.repository.count(where);
  }

  async save(payload: C): Promise<D> {
    try {
      this.logger.debug(`🏗️ Attempting to save entity:`, JSON.stringify(payload, null, 2));
      const result = await this.repository.save(payload);
      this.logger.debug(`✅ Entity saved successfully:`, JSON.stringify(result, null, 2));
      const validatedResult = await this.dtoValidator.validate(result, this.dtoClass as any);
      this.logger.debug(`✅ Entity validated successfully:`, JSON.stringify(validatedResult, null, 2));
      return this.transformDto(Array.isArray(validatedResult) ? validatedResult[0] : validatedResult);
    } catch (error) {
      this.logger.error(`❌ Error saving entity: ${JSON.stringify(payload)}`, error);
      throw error;
    }
  }

  async update(id: string, payload: U) {
    try {
      const result = await this.repository.update(id, payload);
      return this.transformDto(result);
    } catch (error) {
      this.logger.error(`Error updating entity with id ${id}: ${JSON.stringify(payload)}`, error);
      throw error;
    }
  }

  protected relationCheckConfig?: {
    relationFields: string[];
    errorMessage: string;
  };

  private createIncludeRelations(): Record<string, boolean> {
    return (
      this.relationCheckConfig?.relationFields.reduce(
        (acc, field) => {
          acc[field] = true;
          return acc;
        },
        {} as Record<string, boolean>,
      ) || {}
    );
  }

  private checkActiveRelations(entity: any, operationType: string = 'delete'): void {
    if (!this.relationCheckConfig) return;

    for (const relationField of this.relationCheckConfig.relationFields) {
      const relationData = (entity as any)[relationField];

      if (Array.isArray(relationData) && relationData.length > 0) {
        const activeRelations = relationData.filter((item) => !item.status || item.status !== 'INACTIVE');

        if (activeRelations.length > 0) {
          throw new BadRequestException(
            this.relationCheckConfig.errorMessage ||
            `Cannot ${operationType}: Entity has related ${relationField} records`,
          );
        }
      } else if (relationData && typeof relationData === 'object') {
        const isActive = !relationData.status || relationData.status !== 'INACTIVE';
        if (isActive) {
          throw new BadRequestException(
            this.relationCheckConfig.errorMessage ||
            `Cannot ${operationType}: Entity has a related ${relationField} record`,
          );
        }
      }
    }
  }

  async deleteById(id: string): Promise<boolean> {
    try {
      if (this.relationCheckConfig) {
        const includeRelations = this.createIncludeRelations();
        const entity = await this.repository.findById(id, includeRelations);

        if (!entity) {
          throw new NotFoundException(`Entity with id ${id} not found`);
        }

        this.checkActiveRelations(entity);
      }

      return this.repository.deleteById(id);
    } catch (error) {
      this.logger.error(`Error deleting entity with id ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string) {
    return this.repository.deleteById(id);
  }

  protected getSoftDeletePayload(): Partial<U> {
    return { status: 'INACTIVE' } as unknown as Partial<U>;
  }

  async softDeleteById(id: string): Promise<D> {
    try {
      const includeRelations = this.relationCheckConfig ? this.createIncludeRelations() : undefined;
      const entity = await this.repository.findById(id, includeRelations);

      if (!entity) {
        throw new NotFoundException(`Entity with id ${id} not found`);
      }

      this.checkActiveRelations(entity, 'soft delete');

      const softDeletePayload = this.getSoftDeletePayload();
      const result = await this.repository.update(id, softDeletePayload as U);
      return this.transformDto(result);
    } catch (error) {
      this.logger.error(`Error soft deleting entity with id ${id}:`, error);
      throw error;
    }
  }
}
