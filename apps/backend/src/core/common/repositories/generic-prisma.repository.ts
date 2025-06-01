import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { GenericRepository } from '../interfaces/generic-repository.interface';
import { PrismaService } from '@src/prisma/prisma.service';
import { PaginatedResponse } from '@core/http/interfaces/paginated-response.interface';

@Injectable()
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
export abstract class GenericPrismaRepository<T, CreateInput, UpdateInput, WhereUniqueInput>
  implements GenericRepository<T>
{
  protected abstract readonly modelName: string;

  // Optional include relations configuration
  protected readonly defaultIncludes: Record<string, boolean | object> = {};
  protected readonly internalLogger = new Logger(GenericPrismaRepository.name);
  constructor(protected readonly prismaService: PrismaService) {}

  async findAll(
    page = 1,
    limit = 10,
    where = {},
    orderBy = {},
    include?: Record<string, any>,
  ): Promise<PaginatedResponse<T>> {
    const skip = (page - 1) * limit;

    if (!this.prismaService[this.modelName]) {
      throw new Error(`Invalid Prisma model name: ${this.modelName}`);
    }

    const model = this.prismaService[this.modelName];

    const finalInclude = { ...this.defaultIncludes, ...include };
    const effectiveInclude = Object.keys(finalInclude).length > 0 ? finalInclude : undefined;

    // Add this log
    this.internalLogger.debug(
      `[${this.modelName}] Effective include for findAll: ${JSON.stringify(effectiveInclude)}`,
    );

    const [data, totalCount] = await Promise.all([
      model.findMany({
        skip,
        take: Number(limit),
        where,
        orderBy,
        include: effectiveInclude,
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

  async findById(id: string, include?: Record<string, any>): Promise<T> {
    const model = this.prismaService[this.modelName];

    const finalInclude = { ...this.defaultIncludes, ...include };
    const effectiveInclude = Object.keys(finalInclude).length > 0 ? finalInclude : undefined;

    // Add this log
    this.internalLogger.debug(
      `[${this.modelName}] Effective include for findById (${id}): ${JSON.stringify(effectiveInclude)}`,
    );

    const entity = await model.findUnique({
      where: { id },
      include: effectiveInclude,
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

  async findOne(where: any, include?: Record<string, any>): Promise<T | null> {
    const model = this.prismaService[this.modelName];

    const finalInclude = { ...this.defaultIncludes, ...include };
    const effectiveInclude = Object.keys(finalInclude).length > 0 ? finalInclude : undefined;

    // Add this log
    this.internalLogger.debug(
      `[${this.modelName}] Effective include for findOne: ${JSON.stringify(effectiveInclude)}`,
    );

    return model.findFirst({
      where,
      include: effectiveInclude,
    });
  }

  async count(where = {}): Promise<number> {
    const model = this.prismaService[this.modelName];
    return model.count({ where });
  }
}
