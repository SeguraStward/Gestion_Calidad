import { Body, Controller, Delete, Get, Logger, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ExternalProvidersService } from './external-providers.service';
import { CreateExternalProviderDto } from './dtos/create-external-provider.dto';
import { UpdateExternalProviderDto } from './dtos/update-external-provider.dto';

@ApiTags('External Providers')
@Controller('external-providers')
export class ExternalProvidersController {
  private readonly logger = new Logger(ExternalProvidersController.name);

  constructor(private readonly service: ExternalProvidersService) {}

  @Post()
  @ApiOperation({ summary: 'Create external provider' })
  create(@Body() dto: CreateExternalProviderDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all external providers' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get external provider by ID' })
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update external provider' })
  update(@Param('id') id: string, @Body() dto: UpdateExternalProviderDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete external provider' })
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Get('by-annual-allocation/:annualAllocationId')
  @ApiOperation({ summary: 'Get external providers by annual allocation' })
  @ApiParam({ name: 'annualAllocationId', type: String })
  @ApiResponse({ status: 200, description: 'External providers retrieved successfully' })
  async findByAnnualAllocation(@Param('annualAllocationId') annualAllocationId: string) {
    return this.service.findByAnnualAllocation(annualAllocationId);
  }

  @Get('total-provided-time/:annualAllocationId')
  @ApiOperation({ summary: 'Calculate total provided time for an annual allocation' })
  @ApiParam({ name: 'annualAllocationId', type: String })
  @ApiResponse({ status: 200, description: 'Total provided time calculated successfully' })
  async calculateTotalProvidedTime(@Param('annualAllocationId') annualAllocationId: string) {
    return this.service.calculateTotalProvidedTime(annualAllocationId);
  }
}
