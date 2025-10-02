import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { AllocationStatus } from '@una-gc/database/prisma/generated/client';

export class AnnualAllocationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() id?: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber() version?: number;

  @ApiPropertyOptional() @IsOptional() @IsNumber() year?: number;

  @ApiPropertyOptional() @IsOptional() @IsNumber() totalJourneyTime?: number;

  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;

  @ApiPropertyOptional({ enum: AllocationStatus })
  @IsOptional()
  @IsEnum(AllocationStatus)
  status?: AllocationStatus;

  @ApiPropertyOptional() @IsOptional() @IsNumber() totalAllocatedToCampus?: number;

  @ApiPropertyOptional() @IsOptional() @IsNumber() totalFromExternalProviders?: number;

  @ApiPropertyOptional() @IsOptional() @IsNumber() availableJourneyTime?: number;

  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() createdAt?: Date;

  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() updatedAt?: Date;

  @ApiPropertyOptional() @IsOptional() @IsString() createdBy?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() updatedBy?: string;
}
