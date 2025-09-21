import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { AllocationStatus } from '@una-gc/database/prisma/generated/client';

export class CreateAnnualAllocationDto {
  @ApiProperty({ description: 'Año', example: 2025 })
  @IsInt()
  @Min(2000)
  year!: number;

  @ApiProperty({ description: 'Total de jornada anual', example: 100 })
  @IsNumber()
  @IsPositive()
  totalJourneyTime!: number;

  @ApiProperty({ description: 'Descripción', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: AllocationStatus, default: AllocationStatus.DRAFT })
  @IsEnum(AllocationStatus)
  status: AllocationStatus = AllocationStatus.DRAFT;

  @ApiProperty({ description: 'Total a asignar a campus', example: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAllocatedToCampus?: number;

  @ApiProperty({ description: 'Total de externos', example: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalFromExternalProviders?: number;
}
