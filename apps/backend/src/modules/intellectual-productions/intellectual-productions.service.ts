import { GenericService } from '@core/common/interfaces/generic.service';

import { DtoValidator } from '@core/common/dto-validator';

import { Injectable, Logger } from '@nestjs/common';

import { IntellectualProductionDto } from './dtos/intellectual-production.dto';

import { IntellectualProduction } from '@una-gc/database/prisma/generated/client';

import { IntellectualProductionsRepository } from './intellectual-productions.repository';

@Injectable()
export class IntellectualProductionsService extends GenericService<
  IntellectualProduction,
  IntellectualProductionDto,
  IntellectualProductionDto
> {
  protected readonly logger = new Logger(IntellectualProductionsService.name);

  constructor(
    protected readonly intellectualProductionsRepository: IntellectualProductionsRepository,

    protected readonly dtoValidator: DtoValidator,
  ) {
    super(intellectualProductionsRepository, IntellectualProductionDto);
  }
}
