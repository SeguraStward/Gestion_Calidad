import {
  Body,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { buildPrismaInclude } from '@src/core/common/utils';
import { AuditFieldsGuard } from '@src/core/http/guards';
import { JwtAuthGuard } from '@src/modules/auth/guards';
import { PermissionType } from '@una-gc/database/prisma/generated/client';
import { AuthorizedEndpoint } from '../decorators/authorized-endpoint.decorator';
import { CommonApiQueries } from '../decorators/common-api-queries.decorator';
import type { IGenericService } from './generic-service.interface';

@UseGuards(JwtAuthGuard, AuditFieldsGuard)
export abstract class GenericController<D, C, U = Partial<C>> {
  protected abstract readonly logger: Logger;
  protected abstract readonly resourceName: string;

  constructor(protected readonly service: IGenericService<D, C, U>) {}

  @Get()
  @ApiOperation({ summary: 'Find all records with pagination and optional relations' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery(CommonApiQueries.orderBy)
  @ApiQuery(CommonApiQueries.include)
  @ApiResponse({ status: HttpStatus.OK, description: 'Records successfully retrieved' })
  @AuthorizedEndpoint(PermissionType.READ)
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query() where: Record<string, any> = {},
    @Query('orderBy') orderBy?: string,
    @Query('include') includeQueryParam?: string,
  ) {
    const parsedOrderBy = orderBy ? JSON.parse(orderBy) : undefined;
    const { page: _p, limit: _l, orderBy: _o, include: _i, ...filters } = where;

    // Transformar valores numéricos que vienen como strings
    const transformedFilters = this.transformNumericFilters(filters);

    const prismaInclude = buildPrismaInclude(includeQueryParam);

    return this.service.findAll(
      Number(page),
      Number(limit),
      Object.keys(transformedFilters).length ? transformedFilters : undefined,
      parsedOrderBy,
      prismaInclude,
    );
  }

  /**
   * Helper para transformar strings numéricos en números
   */
  protected transformNumericFilters(filters: Record<string, any>): Record<string, any> {
    const transformed: Record<string, any> = {};

    for (const [key, value] of Object.entries(filters)) {
      if (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '') {
        transformed[key] = Number(value);
      } else {
        transformed[key] = value;
      }
    }

    return transformed;
  }

  @Get('count')
  @ApiOperation({ summary: 'Count all records matching criteria' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Count successfully retrieved' })
  async count(@Query() where?: any) {
    return { count: await this.service.count(where) };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find record by id with optional relations' })
  @ApiParam({ name: 'id', type: String })
  @ApiQuery(CommonApiQueries.include)
  @ApiResponse({ status: HttpStatus.OK, description: 'Record successfully retrieved' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Record not found' })
  @AuthorizedEndpoint(PermissionType.READ)
  async findById(@Param('id') id: string, @Query('include') includeQueryParam?: string) {
    const prismaInclude = buildPrismaInclude(includeQueryParam);
    const entity = await this.service.findById(id, prismaInclude);
    if (!entity) throw new NotFoundException(`Entity with id ${id} not found`);
    return entity;
  }

  @Post()
  @ApiOperation({ summary: 'Create new record' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Record successfully created' })
  @HttpCode(HttpStatus.CREATED)
  @AuthorizedEndpoint(PermissionType.CREATE)
  async create(@Body() createDto: C) {
    return this.service.save(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update record by id' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Record successfully updated' })
  @AuthorizedEndpoint(PermissionType.UPDATE)
  async update(@Param('id') id: string, @Body() updateDto: U) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete record by id' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Record successfully deleted' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @AuthorizedEndpoint(PermissionType.DELETE)
  async delete(@Param('id') id: string) {
    await this.service.deleteById(id);
  }

  @Patch(':id/soft-delete')
  @ApiOperation({ summary: 'Mark record as inactive (soft delete)' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Record successfully marked as inactive' })
  @AuthorizedEndpoint(PermissionType.DELETE)
  async softDelete(@Param('id') id: string) {
    return this.service.softDeleteById(id);
  }
}
