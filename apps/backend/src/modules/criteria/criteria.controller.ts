import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

import { CriterionDto } from './dtos/criterion.dto';
import { CreateCriterionDto } from './dtos/create-criterion.dto';
import { UpdateCriterionDto } from './dtos/update-criterion.dto';
import { CriteriaService } from './criteria.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';
import { AuthorizedEndpoint } from '@src/core/common/decorators/authorized-endpoint.decorator';
import { PermissionType } from '@una-gc/database/prisma/generated/client';

@ResourceName('CRITERION')
@Controller('criteria')
export class CriteriaController extends GenericController<CriterionDto, CreateCriterionDto, UpdateCriterionDto> {
  protected readonly logger = new Logger(CriteriaController.name);
  protected readonly resourceName = 'CRITERION';

  constructor(private readonly criteriaService: CriteriaService) {
    super(criteriaService);
  }

  @Get('by-component/:componentId')
  @ApiOperation({ summary: 'Get criteria by component ID' })
  @ApiParam({ name: 'componentId', type: String })
  @ApiResponse({ status: 200, type: [CriterionDto] })
  @AuthorizedEndpoint(PermissionType.READ)
  async getCriteriaByComponent(@Param('componentId') componentId: string) {
    return this.criteriaService.findByComponent(componentId);
  }
}
