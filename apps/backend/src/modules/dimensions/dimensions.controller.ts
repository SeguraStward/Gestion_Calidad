import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Get, Logger, Query } from '@nestjs/common';

import { DimensionDto } from './dtos/dimension.dto';
import { CreateDimensionDto } from './dtos/create-dimension.dto';
import { UpdateDimensionDto } from './dtos/update-dimension.dto';
import { DimensionsService } from './dimensions.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';

@ResourceName('DIMENSION')
@Controller('dimensions')
export class DimensionsController extends GenericController<DimensionDto, CreateDimensionDto, UpdateDimensionDto> {
  protected readonly logger = new Logger(DimensionsController.name);
  protected readonly resourceName = 'DIMENSION';

  constructor(private readonly dimensionsService: DimensionsService) {
    super(dimensionsService);
  }

  /**
   * Override findAll to support include parameter for nested relations
   */
  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('where') where?: Record<string, any>,
    @Query('orderBy') orderBy?: string,
    @Query('include') includeQueryParam?: string,
  ) {
    this.logger.debug(`Finding all dimensions with include query param: ${includeQueryParam}`);

    // Parse include parameter to build Prisma include object
    let includeObject: any = undefined;
    if (includeQueryParam) {
      includeObject = this.parseIncludeString(includeQueryParam);
      this.logger.debug(`Parsed include object: ${JSON.stringify(includeObject, null, 2)}`);
    }

    return this.dimensionsService.findAll(page, limit, where, orderBy, includeObject);
  }

  /**
   * Parse dot-notation include string into nested object
   * Example: "components.criteria.standards" -> { components: { include: { criteria: { include: { standards: true } } } } }
   */
  private parseIncludeString(includeStr: string): any {
    const parts = includeStr.split('.');
    let result: any = {};
    let current = result;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current[part] = true;
      } else {
        current[part] = { include: {} };
        current = current[part].include;
      }
    }

    return result;
  }
}
