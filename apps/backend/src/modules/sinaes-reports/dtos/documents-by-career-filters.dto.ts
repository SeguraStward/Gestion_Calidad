import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class DocumentsByCareerFiltersDto {
  /** When omitted, the inventory covers every ACTIVE career. */
  @ApiPropertyOptional({ type: [String], description: 'Filter by specific career IDs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  careerIds?: string[];

  @ApiPropertyOptional({ description: 'Restrict the inventory to one dimension' })
  @IsOptional()
  @IsString()
  dimensionId?: string;

  @ApiPropertyOptional({ description: 'Restrict the inventory to one component' })
  @IsOptional()
  @IsString()
  componentId?: string;

  @ApiPropertyOptional({ description: 'Restrict the inventory to one criterion' })
  @IsOptional()
  @IsString()
  criterionId?: string;
}
