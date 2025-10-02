import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min, IsPositive } from 'class-validator';
import { AllocationStatus } from '@una-gc/database/prisma/generated/client';

export class CreateCampusAllocationDto {
  @ApiProperty()
  @IsString()
  annualAllocationId!: string;

  @ApiProperty()
  @IsString()
  cycleId!: string;

  @ApiProperty()
  @IsString()
  campusId!: string;

  @ApiProperty()
  @IsString()
  meshId!: string;

  @ApiProperty({ example: 200 })
  @IsNumber()
  @IsPositive()
  allocatedJourneyTime!: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  baseJourneyTimeConsumed: number = 0;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  additionalTime: number = 0;

  // derived: availableJourneyTime (lo calcula el service)

  @ApiProperty({ enum: AllocationStatus, default: AllocationStatus.DRAFT })
  @IsEnum(AllocationStatus)
  status: AllocationStatus = AllocationStatus.DRAFT;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
