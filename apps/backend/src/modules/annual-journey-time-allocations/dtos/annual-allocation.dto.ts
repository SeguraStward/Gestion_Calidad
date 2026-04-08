import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { AllocationStatus } from '@una-gc/database/prisma/generated/client';

export class AnnualAllocationDto {
  @ApiPropertyOptional()
  @Expose() @IsOptional() @IsString() id?: string;

  @ApiPropertyOptional()
  @Expose() @IsOptional() @IsNumber() version?: number;

  @ApiPropertyOptional()
  @Expose() @IsOptional() @IsNumber() year?: number;

  @ApiPropertyOptional()
  @Expose() @IsOptional() @IsNumber() totalJourneyTime?: number;

  @ApiPropertyOptional()
  @Expose() @IsOptional() @IsString() description?: string;

  @ApiPropertyOptional({ enum: AllocationStatus })
  @Expose()
  @IsOptional()
  @IsEnum(AllocationStatus)
  status?: AllocationStatus;

  @ApiPropertyOptional()
  @Expose() @IsOptional() @IsNumber() totalAllocatedToCampus?: number;

  @ApiPropertyOptional()
  @Expose() @IsOptional() @IsNumber() totalFromExternalProviders?: number;

  @ApiPropertyOptional()
  @Expose() @IsOptional() @IsNumber() availableJourneyTime?: number;

  @ApiPropertyOptional()
  @Expose() @IsOptional() @Type(() => Date) @IsDate() createdAt?: Date;

  @ApiPropertyOptional()
  @Expose() @IsOptional() @Type(() => Date) @IsDate() updatedAt?: Date;

  @ApiPropertyOptional()
  @Expose() @IsOptional() @IsString() createdBy?: string;

  @ApiPropertyOptional()
  @Expose() @IsOptional() @IsString() updatedBy?: string;
}
