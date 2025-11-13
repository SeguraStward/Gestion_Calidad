import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ProviderType, Status } from '@una-gc/database/prisma/generated/client';

export class ExternalProviderDto {
  @ApiPropertyOptional() @IsOptional() @IsString() id?: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber() version?: number;

  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;

  @ApiPropertyOptional({ enum: ProviderType })
  @IsOptional()
  @IsEnum(ProviderType)
  providerType?: ProviderType;

  @ApiPropertyOptional() @IsOptional() @IsString() contactEmail?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() contactPhone?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() contactPerson?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() annualAllocationId?: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber() providedJourneyTime?: number;

  @ApiPropertyOptional() @IsOptional() @IsBoolean() isFixedTime?: boolean;

  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() startDate?: Date;

  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() endDate?: Date;

  @ApiPropertyOptional({ enum: Status })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() createdAt?: Date;

  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() updatedAt?: Date;

  @ApiPropertyOptional() @IsOptional() @IsString() createdBy?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() updatedBy?: string;
}
