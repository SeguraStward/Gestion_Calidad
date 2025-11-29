import { Body, Controller, Get, Logger, Param, Post, Query } from '@nestjs/common';
import { GenericController } from '@core/common/interfaces/generic.controller';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CampusJourneyTimeAllocationsService } from './campus-journey-time-allocations.service';
import { CampusAllocationDto } from './dtos/campus-allocation.dto';
import { CreateCampusAllocationDto } from './dtos/create-campus-allocation.dto';
import { UpdateCampusAllocationDto } from './dtos/update-campus-allocation.dto';
import { ValidateAvailabilityDto } from './dtos/validate-availability.dto';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';
import { AuthorizedEndpoint } from '@core/common/decorators/authorized-endpoint.decorator';
import { PermissionType } from '@una-gc/database/prisma/generated/client';

@ApiTags('Campus Journey Time Allocations')
@ResourceName('CAMPUS_ALLOCATION')
@Controller('campus-journey-time-allocations')
export class CampusJourneyTimeAllocationsController extends GenericController<
  CampusAllocationDto,
  CreateCampusAllocationDto,
  UpdateCampusAllocationDto
> {
  protected readonly logger = new Logger(CampusJourneyTimeAllocationsController.name);
  protected readonly resourceName = 'CAMPUS_ALLOCATION';

  constructor(private readonly serviceImpl: CampusJourneyTimeAllocationsService) {
    super(serviceImpl);
  }

  @Get()
  @ApiOperation({ summary: 'Get all campus allocations with populated relations' })
  @ApiResponse({ status: 200, description: 'Campus allocations retrieved successfully' })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query() where: Record<string, any> = {},
    @Query('orderBy') orderBy?: string,
    @Query('include') includeQueryParam?: string,
  ) {
    this.logger.debug('🎯 Custom findAll() called in controller');
    const result = await this.serviceImpl.findAll(page, limit, where, orderBy, includeQueryParam);
    this.logger.debug(`🎯 Got ${result.data.length} allocations from service`);
    return result;
  }

  @Get('raw/:id')
  @ApiOperation({ summary: 'Get campus allocation without DTO transformation' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Campus allocation retrieved successfully' })
  async getRaw(@Param('id') id: string) {
    return this.serviceImpl.findByIdRaw(id);
  }

  @Get(':id/available-time')
  @ApiOperation({ summary: 'Calculate available time in real-time for a campus allocation' })
  @ApiParam({ name: 'id', type: String, description: 'Campus allocation ID' })
  @ApiResponse({ status: 200, description: 'Available time calculated successfully' })
  @AuthorizedEndpoint(PermissionType.READ)
  async getAvailableTime(@Param('id') id: string) {
    return this.serviceImpl.calculateAvailableTime(id);
  }

  @Post(':id/validate-availability')
  @ApiOperation({ summary: 'Validate if requested time is available before assignment' })
  @ApiParam({ name: 'id', type: String, description: 'Campus allocation ID' })
  @ApiResponse({ status: 200, description: 'Availability validation completed' })
  @AuthorizedEndpoint(PermissionType.READ)
  async validateAvailability(@Param('id') id: string, @Body() dto: ValidateAvailabilityDto) {
    return this.serviceImpl.validateAvailability(id, dto.requestedTime);
  }
}
