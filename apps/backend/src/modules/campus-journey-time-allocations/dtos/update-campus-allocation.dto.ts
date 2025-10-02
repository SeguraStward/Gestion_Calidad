import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min, IsPositive } from 'class-validator';
import { AllocationStatus } from '@una-gc/database/prisma/generated/client';

export class UpdateCampusAllocationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() annualAllocationId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cycleId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() campusId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() meshId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  allocatedJourneyTime?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  baseJourneyTimeConsumed?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  additionalTime?: number;

  @ApiPropertyOptional({ enum: AllocationStatus })
  @IsOptional()
  @IsEnum(AllocationStatus)
  status?: AllocationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
