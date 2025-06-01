import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { GenericRepository } from './generic-repository.interface';
import { IGenericService } from './generic-service.interface';
import { DtoValidator } from '../dto-validator';
import { plainToClass } from 'class-transformer'; // Make sure plainToClass is imported

@Injectable()
export abstract class GenericService<E extends Record<string, any>, D, C = any, U = any>
  implements IGenericService<D, C, U>
{
  protected abstract logger: Logger;

  constructor(
    protected readonly repository: GenericRepository<E>,
    protected readonly dtoClass?: new (...args: any[]) => D, // Adjusted constructor signature for dtoClass
    protected readonly dtoValidator?: DtoValidator,
  ) {}

  private transformDto(entity: E): D;
  private transformDto(entity: E[]): D[];
  private transformDto(entity: E | E[]): D | D[] {
    // this.logger.debug('Bypassing DTO transformation for debugging includes.');
    // return entity as any;

    // Restore original logic:
    if (!this.dtoClass) {
      this.logger.warn(`dtoClass is not defined in ${this.constructor.name}, returning raw entity/entities.`);
      if (Array.isArray(entity)) {
        return entity as any as D[];
      }
      return entity as any as D;
    }

    if (Array.isArray(entity)) {
      // Ensure you have a consistent strategy for excludeExtraneousValues
      // If your DTOs use @Expose(), then excludeExtraneousValues: true is appropriate.
      // If not, you might want it to be false or omit it.
      return entity.map((e) => plainToClass(this.dtoClass!, e, { excludeExtraneousValues: true }));
    } else {
      return plainToClass(this.dtoClass!, entity, { excludeExtraneousValues: true });
    }
  }

  async findAll(page = 1, limit = 10, where?: any, orderBy?: any, include?: any) {
    try {
      const result = await this.repository.findAll(page, limit, where, orderBy, include);
      return {
        data: this.transformDto(result.data), // This will now use the restored transformation
        meta: result.meta,
      };
    } catch (error) {
      this.logger.error('Error fetching records', error);
      throw error;
    }
  }

  async findById(id: string, include?: any): Promise<D | null> {
    this.logger.debug(`Finding entity by id: ${id} with includes: ${JSON.stringify(include)}`);
    try {
      const entity = await this.repository.findById(id, include);
      if (!entity) {
        this.logger.warn(`Entity with id ${id} not found`);
        return null;
      }
      this.logger.debug(`Entity found: ${JSON.stringify(entity)}`);
      return this.transformDto(entity) as D; // This will now use the restored transformation
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`Entity with id ${id} not found`);
      }
      // Updated error logging
      if (error instanceof Error) {
        this.logger.error(`Error in findById for id ${id}: ${error.message}`, error.stack);
      } else {
        this.logger.error(`Error in findById for id ${id}:`, error);
      }
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
    this.logger.log(`Creating entity with data: ${JSON.stringify(payload)}`);
    try {
      const result = await this.repository.save(payload);
      const validatedResult = await this.dtoValidator.validate(result, this.dtoClass as any);
      this.logger.log(`Created entity: ${JSON.stringify(validatedResult)}`);
      return this.transformDto(Array.isArray(validatedResult) ? validatedResult[0] : validatedResult);
    } catch (error) {
      this.logger.error(`Error saving entity: ${JSON.stringify(payload)}`, error);
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

  async delete(id: string) {
    return this.repository.deleteById(id);
  }

  async deleteById(id: string) {
    return this.repository.deleteById(id);
  }
}
