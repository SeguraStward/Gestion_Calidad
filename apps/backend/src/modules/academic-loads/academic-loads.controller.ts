import { GenericController } from '@core/common/interfaces/generic.controller';
import {
  Controller,
  Logger,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  ParseEnumPipe,
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

  @Post()
  async create(@Body() createDto: AcademicLoadDto) {
    this.logger.log(`Creating academic load with data: ${JSON.stringify(createDto)}`);
    return this.academicLoadsService.save(createDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: Partial<AcademicLoadDto>) {
    this.logger.log(`Updating academic load ${id} with data: ${JSON.stringify(updateDto)}`);
    return this.academicLoadsService.update(id, updateDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Finding academic load by id: ${id}`);
    return this.academicLoadsService.findById(id);
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('search') search?: string,
    @Query('orderBy') orderBy?: string,
  ) {
    this.logger.log(`Finding all academic loads - page: ${page}, limit: ${limit}, search: ${search}`);

    // Build where clause if search is provided
    let where = undefined;
    if (search) {
      where = {
        OR: [
          { nrc: { contains: search, mode: 'insensitive' } },
          { course: { name: { contains: search, mode: 'insensitive' } } },
          { professor: { fullName: { contains: search, mode: 'insensitive' } } },
        ],
      };
    }

    const parsedOrderBy = orderBy ? JSON.parse(orderBy) : undefined;
    return this.academicLoadsService.findAll(page, limit, where, parsedOrderBy);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    this.logger.log(`Deleting academic load with id: ${id}`);
    return this.academicLoadsService.delete(id);
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
