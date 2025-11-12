import { Body, Controller, Delete, Get, Logger, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { InstitutionalProjectsService } from './institutional-projects.service';
import { CreateInstitutionalProjectDto } from './dtos/create-institutional-project.dto';
import { UpdateInstitutionalProjectDto } from './dtos/update-institutional-project.dto';

@ApiTags('Institutional Projects')
@Controller('institutional-projects')
export class InstitutionalProjectsController {
  private readonly logger = new Logger(InstitutionalProjectsController.name);

  constructor(private readonly service: InstitutionalProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create institutional project' })
  create(@Body() dto: CreateInstitutionalProjectDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all institutional projects' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get institutional project by ID' })
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update institutional project' })
  update(@Param('id') id: string, @Body() dto: UpdateInstitutionalProjectDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete institutional project' })
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Get('by-campus-allocation/:campusAllocationId')
  @ApiOperation({ summary: 'Get institutional projects by campus allocation' })
  @ApiParam({ name: 'campusAllocationId', type: String })
  @ApiResponse({ status: 200, description: 'Institutional projects retrieved successfully' })
  async findByCampusAllocation(@Param('campusAllocationId') campusAllocationId: string) {
    return this.service.findByCampusAllocation(campusAllocationId);
  }

  @Get('by-director/:directorId')
  @ApiOperation({ summary: 'Get institutional projects by director' })
  @ApiParam({ name: 'directorId', type: String })
  @ApiResponse({ status: 200, description: 'Institutional projects retrieved successfully' })
  async findByDirector(@Param('directorId') directorId: string) {
    return this.service.findByDirector(directorId);
  }

  @Get('total-assigned-time/:campusAllocationId')
  @ApiOperation({ summary: 'Calculate total assigned time for a campus allocation' })
  @ApiParam({ name: 'campusAllocationId', type: String })
  @ApiResponse({ status: 200, description: 'Total assigned time calculated successfully' })
  async calculateTotalAssignedTime(@Param('campusAllocationId') campusAllocationId: string) {
    return this.service.calculateTotalAssignedTime(campusAllocationId);
  }

  @Get('with-available-time')
  @ApiOperation({ summary: 'Get projects with available time for assignment' })
  @ApiResponse({ status: 200, description: 'Projects with available time retrieved successfully' })
  async findWithAvailableTime() {
    return this.service.findWithAvailableTime();
  }
}
