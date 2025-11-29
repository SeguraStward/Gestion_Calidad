import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';

/**
 * DTO for filters when generating a compliance report
 */
export class GenerateReportFiltersDto {
  @ApiPropertyOptional({ description: 'Filter by dimension ID' })
  @IsOptional()
  @IsString()
  dimensionId?: string;

  @ApiPropertyOptional({ description: 'Filter by component ID' })
  @IsOptional()
  @IsString()
  componentId?: string;

  @ApiPropertyOptional({ description: 'Filter by criterion ID' })
  @IsOptional()
  @IsString()
  criterionId?: string;

  @ApiPropertyOptional({ description: 'Filter by career ID' })
  @IsOptional()
  @IsString()
  careerId?: string;

  @ApiPropertyOptional({ description: 'Start date for documents filter (ISO string)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'End date for documents filter (ISO string)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Optional report name' })
  @IsOptional()
  @IsString()
  reportName?: string;

  @ApiPropertyOptional({ description: 'Optional report description' })
  @IsOptional()
  @IsString()
  description?: string;
}
