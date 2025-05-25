import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { RegionalCenterDto } from './dtos/regional-center.dto';
import { RegionalCenter } from '@una-gc/database/prisma/generated/client';
import { RegionalCentersRepository } from './regional-centers.repository';

@Injectable()
export class RegionalCentersService extends GenericService<
  RegionalCenter,
  RegionalCenterDto,
  RegionalCenterDto
> {
  protected readonly logger = new Logger(RegionalCentersService.name);

  constructor(
    protected readonly regionalCentersRepository: RegionalCentersRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(regionalCentersRepository, RegionalCenterDto);
  }
}
