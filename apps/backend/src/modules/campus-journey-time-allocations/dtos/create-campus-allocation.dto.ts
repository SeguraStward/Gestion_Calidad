import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min, IsPositive } from 'class-validator';
import { AllocationStatus } from '@una-gc/database/prisma/generated/client';

export class CreateCampusAllocationDto {
  @ApiProperty() @IsString() annualAllocationId!: string;
  @ApiProperty() @IsString() cycleId!: string;
  @ApiProperty() @IsString() campusId!: string;
  @ApiProperty() @IsString() meshId!: string;

  @ApiProperty({ example: 50 }) @IsNumber() @IsPositive() allocatedTime!: number;
  @ApiProperty({ example: 0 }) @IsNumber() @Min(0) baseTimeConsumed: number = 0;
  @ApiProperty({ example: 0 }) @IsNumber() @Min(0) additionalTime: number = 0;

  // derived: availableTime (lo calcula el service)

  @ApiProperty({ enum: AllocationStatus, default: AllocationStatus.DRAFT })
  @IsEnum(AllocationStatus)
  status: AllocationStatus = AllocationStatus.DRAFT;

  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
}
