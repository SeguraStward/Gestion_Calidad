import { Injectable, NotFoundException } from '@nestjs/common';
import { GenericRepository } from '../interfaces/generic-repository.interface';
import { PrismaService } from '@src/prisma/prisma.service';
import { PaginatedResponse } from '@core/http/interfaces/paginated-response.interface';

@Injectable()
export abstract class GenericPrismaRepository<T, CreateInput, UpdateInput, WhereUniqueInput>
  implements GenericRepository<T>
{
  protected abstract readonly modelName: string;

  // Optional include relations configuration
  protected readonly defaultIncludes: Record<string, boolean | object> = {};
  constructor(protected readonly prismaService: PrismaService) {}

  async findAll(page = 1, limit = 10, where = {}, orderBy = {}): Promise<PaginatedResponse<T>> {
    const skip = (page - 1) * limit;

    if (!this.prismaService[this.modelName]) {
      throw new Error(`Invalid Prisma model name: ${this.modelName}`);
    }

    const model = this.prismaService[this.modelName];

    const [data, totalCount] = await Promise.all([
      model.findMany({
        skip,
        take: Number(limit),
        where,
        orderBy,
        include: this.defaultIncludes,
      }),
      model.count({ where }),
    ]);

    return {
      data,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
      },
    };
  }

  async findById(id: string): Promise<T> {
    const model = this.prismaService[this.modelName];
    const entity = await model.findUnique({
      where: { id },
      include: this.defaultIncludes,
    });

    if (!entity) {
      throw new NotFoundException(`${this.modelName} with id ${id} not found`);
    }

    return entity;
  }

  async save(payload: CreateInput | CreateInput[]): Promise<T | T[]> {
    const model = this.prismaService[this.modelName];

    if (Array.isArray(payload)) {
      return this.prismaService.$transaction(
        payload.map((item) =>
          model.create({
            data: item,
            include: this.defaultIncludes,
          }),
        ),
      );
    }

    return model.create({
      data: payload,
      include: this.defaultIncludes,
    });
  }

  async update(id: string, payload: UpdateInput): Promise<T> {
    const model = this.prismaService[this.modelName];

    try {
      return await model.update({
        where: { id },
        data: payload,
        include: this.defaultIncludes,
      });
    } catch (error) {
      if (error === 'P2025') {
        throw new NotFoundException(`${this.modelName} with id ${id} not found`);
      }
      throw error;
    }
  }

  async deleteById(id: string): Promise<boolean> {
    try {
      const model = this.prismaService[this.modelName];
      await model.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      if (error === 'P2025') {
        throw new NotFoundException(`${this.modelName} with id ${id} not found`);
      }
      return false;
    }
  }

  async findOne(where: any): Promise<T | null> {
    const model = this.prismaService[this.modelName];
    return model.findFirst({
      where,
      include: this.defaultIncludes,
    });
  }

  async count(where = {}): Promise<number> {
    const model = this.prismaService[this.modelName];
    return model.count({ where });
  }
}
