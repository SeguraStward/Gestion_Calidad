import {
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Logger,
  NotFoundException,
  HttpStatus,
  HttpCode,
  UseGuards,
  ExecutionContext,
  createParamDecorator,
} from '@nestjs/common';

import type { IGenericService } from './generic-service.interface';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { PermissionType } from '@una-gc/database/prisma/generated/client';

import { AuditFieldsGuard } from '@src/core/http/guards';
import { buildPrismaInclude } from '@src/core/common/utils';

import { JwtAuthGuard, PermissionsGuard } from '@src/modules/auth/guards';
import { RequirePermissions, RESOURCE_NAME_TOKEN } from '@src/modules/auth/decorators';

export const ResourceNameParam = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const controller = ctx.getClass();
  const instance = ctx.getHandler().bind(controller.prototype);
  return instance().resourceName;
});

@UseGuards(JwtAuthGuard, AuditFieldsGuard)
export abstract class GenericController<D, C, U = Partial<C>> {
  protected abstract readonly logger: Logger;
  protected abstract readonly resourceName: string;

  constructor(protected readonly service: IGenericService<D, C, U>) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find all records with pagination and optional relations' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    type: String,
    description: 'JSON string for order by, e.g., {"name":"asc"}',
  })
  @ApiQuery({
    name: 'include',
    required: false,
    type: String,
    description:
      'Comma-separated list of relations to include, e.g., academicLoad,professor,academicLoad.course',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Records successfully retrieved' })
  @UseGuards(PermissionsGuard)
  @RequirePermissions({ resource: RESOURCE_NAME_TOKEN, action: PermissionType.READ })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query() where?: any,
    @Query('orderBy') orderBy?: string,
    @Query('include') includeQueryParam?: string,
  ) {
    const parsedOrderBy = orderBy ? JSON.parse(orderBy) : undefined;
    const filters = { ...where };
    delete filters.page;
    delete filters.limit;
    delete filters.orderBy;
    delete filters.include;

    const prismaInclude = buildPrismaInclude(includeQueryParam);

    return this.service.findAll(
      page ? parseInt(String(page), 10) : 1,
      limit ? parseInt(String(limit), 10) : 10,
      Object.keys(filters).length > 0 ? filters : undefined,
      parsedOrderBy,
      prismaInclude,
    );
  }

  @Get('count')
  @ApiOperation({ summary: 'Count all records matching criteria' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Count successfully retrieved' })
  async count(@Query() where?: any) {
    return { count: await this.service.count(where) };
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find record by id with optional relations' })
  @ApiParam({ name: 'id', type: String })
  @ApiQuery({
    name: 'include',
    required: false,
    type: String,
    description:
      'Comma-separated list of relations to include, e.g., academicLoad,professor,academicLoad.course',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Record successfully retrieved' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Record not found' })
  @UseGuards(PermissionsGuard)
  @RequirePermissions({ resource: RESOURCE_NAME_TOKEN, action: PermissionType.READ })
  async findById(@Param('id') id: string, @Query('include') includeQueryParam?: string) {
    const prismaInclude = buildPrismaInclude(includeQueryParam);
    const entity = await this.service.findById(id, prismaInclude);
    if (!entity) {
      throw new NotFoundException(`Entity with id ${id} not found`);
    }
    return entity;
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new record' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Record successfully created' })
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionsGuard)
  @RequirePermissions({ resource: RESOURCE_NAME_TOKEN, action: PermissionType.CREATE })
  async create(@Body() createDto: C) {
    return await this.service.save(createDto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update record by id' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Record successfully updated' })
  @UseGuards(PermissionsGuard)
  @RequirePermissions({ resource: RESOURCE_NAME_TOKEN, action: PermissionType.UPDATE })
  async update(@Param('id') id: string, @Body() updateDto: U) {
    return await this.service.update(id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete record by id' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Record successfully deleted' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(PermissionsGuard)
  @RequirePermissions({ resource: RESOURCE_NAME_TOKEN, action: PermissionType.DELETE })
  async delete(@Param('id') id: string) {
    await this.service.deleteById(id);
    return;
  }
}
