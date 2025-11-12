import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectType, AllocationStatus, Status } from '@una-gc/database/prisma/generated/client';

export class InstitutionalProjectDto {
  @ApiPropertyOptional() @IsOptional() @IsString() id?: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber() version?: number;

  @ApiPropertyOptional() @IsOptional() @IsString() code?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() title?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() objectives?: string;

  @ApiPropertyOptional({ enum: ProjectType })
  @IsOptional()
  @IsEnum(ProjectType)
  projectType?: ProjectType;

  @ApiPropertyOptional() @IsOptional() @IsNumber() requiredJourneyTime?: number;

  @ApiPropertyOptional() @IsOptional() @IsNumber() assignedJourneyTime?: number;

  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() startDate?: Date;

  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() endDate?: Date;

  @ApiPropertyOptional() @IsOptional() @IsString() campusAllocationId?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() directorId?: string;

  @ApiPropertyOptional({ enum: AllocationStatus })
  @IsOptional()
  @IsEnum(AllocationStatus)
  projectStatus?: AllocationStatus;

  @ApiPropertyOptional({ enum: Status })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() createdAt?: Date;

  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() updatedAt?: Date;

  @ApiPropertyOptional() @IsOptional() @IsString() createdBy?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() updatedBy?: string;
}
