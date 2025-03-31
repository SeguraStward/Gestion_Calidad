import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { GenericRepository } from './generic-repository.interface';
import { IGenericService } from './generic-service.interface';
import { DtoValidator } from '../dto-validator';

@Injectable()
export abstract class GenericService<E extends Record<string, any>, D, C = any, U = any>
  implements IGenericService<D, C, U>
{
  protected abstract logger: Logger;

  constructor(
    protected readonly repository: GenericRepository<E>,
    protected readonly dtoClass?: new (entity: E) => D,
    protected readonly dtoValidator?: DtoValidator,
  ) {}

  private transformDto(entity: E): D;
  private transformDto(entity: E[]): D[];
  private transformDto(entity: E | E[]): D | D[] {
    if (!this.dtoClass) return entity as unknown as D;

    if (Array.isArray(entity)) {
      return entity.map((item) => {
        if (item instanceof this.dtoClass) {
          return item as unknown as D;
        }

        return new this.dtoClass!(item);
      });
    } else {
      if (entity instanceof this.dtoClass) {
        return entity as unknown as D;
      }

      return new this.dtoClass(entity);
    }
  }

  async findAll(page = 1, limit = 10, where?: any, orderBy?: any) {
    try {
      const result = await this.repository.findAll(page, limit, where, orderBy);
      return {
        data: this.transformDto(result.data),
        meta: {
          limit: result.meta.limit,
          page: result.meta.page,
          total: result.meta.total,
        },
      };
    } catch (error) {
      this.logger.error('Error fetching records', error);
      throw error;
    }
  }

  async findById(id: string) {
    this.logger.debug(`Finding entity by id: ${id}`);
    try {
      const entity = await this.repository.findById(id).catch(() => null);
      if (!entity) {
        this.logger.warn(`Entity with id ${id} not found`);
        return null;
      }
      this.logger.debug(`Entity found: ${JSON.stringify(entity)}`);
      return this.transformDto(entity) as D;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`Entity with id ${id} not found`);
      }
      throw error;
    }
  }

  async findOne(where: any) {
    try {
      const entity = await this.repository.findOne(where);
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
