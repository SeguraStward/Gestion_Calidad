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
} from '@nestjs/common';
import type { IGenericService } from './generic-service.interface';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from '@src/modules/auth/guards/jwt-auth.guard';
// import { PermissionsGuard } from '@src/modules/auth/guards/permissions.guard';
// import { RequirePermissions } from '@src/modules/auth/decorators/require-permissions.decorator';

// import { PermissionType } from '@una-gc/database/prisma/generated/client';

@UseGuards(JwtAuthGuard)
export abstract class GenericController<D, C, U = Partial<C>> {
  protected abstract readonly logger: Logger;
  constructor(protected readonly service: IGenericService<D, C, U>) {}

  @Get()
  //@UseGuards(PermissionsGuard)
  //@RequirePermissions({ resource: 'resourceName', action: PermissionType.READ })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find all records with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Records successfully retrieved' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query() where?: any,
    @Query('orderBy') orderBy?: string,
  ) {
    const parsedOrderBy = orderBy ? JSON.parse(orderBy) : undefined;
    const filters = { ...where };

    delete filters.page;
    delete filters.limit;
    delete filters.orderBy;

    return this.service.findAll(
      page ? parseInt(String(page), 10) : 1,
      limit ? parseInt(String(limit), 10) : 10,
      Object.keys(filters).length > 0 ? filters : undefined,
      parsedOrderBy,
    );
  }

  @Get('count')
  @ApiOperation({ summary: 'Count all records matching criteria' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Count successfully retrieved' })
  async count(@Query() where?: any) {
    return { count: await this.service.count(where) };
  }

  @Get(':id')
  //@UseGuards(PermissionsGuard)
  //@RequirePermissions({ resource: 'resourceName', action: PermissionType.READ })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find record by id' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Record successfully retrieved' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Record not found' })
  async findById(@Param('id') id: string) {
    const entity = await this.service.findById(id);
    if (!entity) {
      throw new NotFoundException(`Entity with id ${id} not found`);
    }
    return entity;
  }

  @Post()
  @ApiOperation({ summary: 'Create new record' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Record successfully created' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: C) {
    return await this.service.save(createDto);
  }

  @Put(':id')
  //@UseGuards(PermissionsGuard)
  //@RequirePermissions({ resource: 'resourceName', action: PermissionType.UPDATE })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update record by id' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Record successfully updated' })
  async update(@Param('id') id: string, @Body() updateDto: U) {
    return await this.service.update(id, updateDto);
  }

  @Delete(':id')
  //@UseGuards(PermissionsGuard)
  //@RequirePermissions({ resource: 'resourceName', action: PermissionType.DELETE })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete record by id' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Record successfully deleted' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.service.deleteById(id);
    return;
  }
}
