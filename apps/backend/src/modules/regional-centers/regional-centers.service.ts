import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma, Status } from '@una-gc/database/prisma/generated/client';

import { RegionalCenterDto } from './dtos/regional-center.dto';
import { RegionalCenter } from '@una-gc/database/prisma/generated/client';
import { RegionalCentersRepository } from './regional-centers.repository';
import { PaginatedResponse } from '@core/http/interfaces/paginated-response.interface';

// Define full include object for relations
const FULL_INCLUDE: Prisma.RegionalCenterInclude = {
  campuses: true,
};

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
    super(regionalCentersRepository, RegionalCenterDto, dtoValidator);
  }

  // Override save to handle relations properly
  async save(payload: RegionalCenterDto): Promise<RegionalCenterDto> {
    this.logger.debug(`Saving regional center with payload: ${JSON.stringify(payload)}`);
    const data: Prisma.RegionalCenterCreateInput = {
      ...payload,
      campuses: { connect: { id: payload.campusId } },
    };
    return super.save(data as any);
  }

  // Override update to handle relations properly
  async update(id: string, payload: Partial<RegionalCenterDto>): Promise<RegionalCenterDto> {
    this.logger.debug(`Updating regional center ${id} with payload: ${JSON.stringify(payload)}`);
    const data: Prisma.RegionalCenterUpdateInput = {
      ...payload,
      ...(payload.campusId && { campuses: { connect: { id: payload.campusId } } }),
    };
    return super.update(id, data as any);
  }

  // Override findById to include all relations
  async findById(id: string): Promise<RegionalCenterDto | null> {
    return this.regionalCentersRepository.findById(id, FULL_INCLUDE) as any;
  }

  // Override findAll to include all relations
  async findAll(
    page = 1,
    limit = 10,
    where?: Prisma.RegionalCenterWhereInput,
    orderBy?: Prisma.RegionalCenterOrderByWithRelationInput,
  ): Promise<PaginatedResponse<RegionalCenterDto>> {
    return super.findAll(page, limit, where, orderBy, FULL_INCLUDE);
  }

  // Custom method for finding by campus
  async findAllByCampusId(
    campusId: string,
    page = 1,
    limit = 10,
    status?: Status,
    orderBy?: Prisma.RegionalCenterOrderByWithRelationInput,
  ): Promise<PaginatedResponse<RegionalCenterDto>> {
    const where: Prisma.RegionalCenterWhereInput = { 
      campuses: { some: { id: campusId } },
      ...(status && { status })
    };
    return super.findAll(page, limit, where, orderBy, FULL_INCLUDE);
  }
}
