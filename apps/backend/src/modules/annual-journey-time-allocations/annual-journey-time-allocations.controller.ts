import { Controller, Get, Logger, Param } from '@nestjs/common';
import { GenericController } from '@core/common/interfaces/generic.controller';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AnnualJourneyTimeAllocationsService } from './annual-journey-time-allocations.service';
import { AnnualAllocationDto } from './dtos/annual-allocation.dto';
import { CreateAnnualAllocationDto } from './dtos/create-annual-allocation.dto';
import { UpdateAnnualAllocationDto } from './dtos/update-annual-allocation.dto';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';
import { AuthorizedEndpoint } from '@core/common/decorators/authorized-endpoint.decorator';
import { PermissionType } from '@una-gc/database/prisma/generated/client';

@ApiTags('Annual Journey Time Allocations')
@ResourceName('ANNUAL_ALLOCATION')
@Controller('annual-journey-time-allocations')
export class AnnualJourneyTimeAllocationsController extends GenericController<
  AnnualAllocationDto,
  CreateAnnualAllocationDto,
  UpdateAnnualAllocationDto
> {
  protected readonly logger = new Logger(AnnualJourneyTimeAllocationsController.name);
  protected readonly resourceName = 'ANNUAL_ALLOCATION';

  constructor(private readonly serviceImpl: AnnualJourneyTimeAllocationsService) {
    super(serviceImpl);
  }

  @Get('summary/:year')
  @ApiOperation({ summary: 'Get comprehensive summary for a specific year' })
  @ApiParam({ name: 'year', type: Number, description: 'Academic year' })
  @ApiResponse({ status: 200, description: 'Summary retrieved successfully' })
  @AuthorizedEndpoint(PermissionType.READ)
  async getSummary(@Param('year') year: string) {
    return this.serviceImpl.getYearSummary(Number(year));
  }
}
