import { GenericController } from '@core/common/interfaces/generic.controller';
import {
  Controller,
  Logger,
  Get,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  ParseEnumPipe, // Import ParseEnumPipe
} from '@nestjs/common';
// import { buildPrismaInclude } from '@src/utils/prisma-include.parser';
import { Status } from '@una-gc/database/prisma/generated/client';

import { AcademicLoadDto } from './dtos/academic-load.dto';
import { AcademicLoadsService } from './academic-loads.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';

@ResourceName('ACADEMIC_LOAD')
@Controller('academic-loads')
export class AcademicLoadsController extends GenericController<AcademicLoadDto, AcademicLoadDto> {
  protected readonly logger = new Logger(AcademicLoadsController.name);
  protected readonly resourceName = 'ACADEMIC_LOAD';
  constructor(private readonly academicLoadsService: AcademicLoadsService) {
    super(academicLoadsService);
  }

  @Get('professor/:professorId')
  async findAllByProfessorId(
    @Param('professorId') professorId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    // Use ParseEnumPipe for status
    @Query('status', new ParseEnumPipe(Status, { optional: true })) status?: Status,
    @Query('orderBy') orderBy?: string,
    @Query('include') includeQueryParam?: string,
  ) {
    this.logger.log(
      `Request to find all academic loads for professorId: ${professorId}, status: ${status}, page: ${page}, limit: ${limit}, orderBy: ${orderBy}, include: ${includeQueryParam}`,
    );

    const parsedOrderBy = orderBy ? JSON.parse(orderBy) : undefined;
    // const prismaInclude = buildPrismaInclude(includeQueryParam);

    return this.academicLoadsService.findAllByProfessorId(
      professorId,
      page,
      limit,
      status, // Pass status to service
      parsedOrderBy,
      // Removed prismaInclude to match service signature
    );
  }
}
