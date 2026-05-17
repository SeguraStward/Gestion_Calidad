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

  /**
   * Configuration used by `checkActiveRelations` to block deletion when an
   * entity still has active children.
   *
   * - `errorMessage` can be either a static string (backward-compatible) or a
   *   function that receives the entity and a per-field map of active children
   *   counts, so concrete services can produce user-facing Spanish messages
   *   with the entity name and counts (e.g. "No se puede eliminar la
   *   dimensión 'Docencia' porque tiene 3 componente(s) activo(s)...").
   */
  protected relationCheckConfig?: {
    relationFields: string[];
    errorMessage:
      | string
      | ((entity: any, activeCounts: Record<string, number>) => string);
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

    // Compute active counts for every configured relation so the error message
    // (when it's a function) can describe ALL blocking relations, not just the
    // first one encountered.
    const activeCounts: Record<string, number> = {};
    for (const relationField of this.relationCheckConfig.relationFields) {
      const relationData = (entity as any)[relationField];
      if (Array.isArray(relationData)) {
        activeCounts[relationField] = relationData.filter(
          (item) => !item.status || item.status !== 'INACTIVE',
        ).length;
      } else if (relationData && typeof relationData === 'object') {
        const isActive = !relationData.status || relationData.status !== 'INACTIVE';
        activeCounts[relationField] = isActive ? 1 : 0;
      } else {
        activeCounts[relationField] = 0;
      }
    }

    const hasBlocking = Object.values(activeCounts).some((n) => n > 0);
    if (!hasBlocking) return;

    const { errorMessage } = this.relationCheckConfig;
    const message =
      typeof errorMessage === 'function'
        ? errorMessage(entity, activeCounts)
        : errorMessage ||
          `Cannot ${operationType}: Entity has related records (${Object.entries(activeCounts)
            .filter(([, n]) => n > 0)
            .map(([k, n]) => `${k}: ${n}`)
            .join(', ')})`;

    throw new BadRequestException(message);
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
