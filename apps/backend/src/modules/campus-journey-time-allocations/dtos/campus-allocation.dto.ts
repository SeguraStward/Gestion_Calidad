import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { AllocationStatus } from '@una-gc/database/prisma/generated/client';

export class CampusAllocationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() id?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() annualAllocationId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cycleId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() campusId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() meshId?: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber() allocatedJourneyTime?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() baseJourneyTimeConsumed?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() additionalTime?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() availableJourneyTime?: number;

  @ApiPropertyOptional() @IsOptional() @IsEnum(AllocationStatus) status?: AllocationStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;

  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() createdAt?: Date;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() updatedAt?: Date;
  @ApiPropertyOptional() @IsOptional() @IsString() createdBy?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() updatedBy?: string;
}
