import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDate, ValidateNested, IsArray } from 'class-validator';

import { Type } from 'class-transformer';
import { BaseDto } from '@src/modules/generalDto';

export class ProjectLogEntryDto {
  @ApiProperty({ description: 'Version number', default: 0 })
  @IsOptional()
  version?: number;

  @ApiPropertyOptional({ description: 'User ID who updated the entry' })
  @IsString()
  @IsOptional()
  updatedBy?: string;

  @ApiPropertyOptional({ description: 'Session ID reference' })
  @IsString()
  @IsOptional()
  session?: string;

  @ApiPropertyOptional({ description: 'Review ID reference' })
  @IsString()
  @IsOptional()
  review?: string;

  @ApiPropertyOptional({ description: 'Document ID reference' })
  @IsString()
  @IsOptional()
  document?: string;

  @ApiPropertyOptional({ description: 'Note associated with the entry' })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ description: 'Date of the log entry', default: 'now()' })
  @IsDate()
  @IsOptional()
  date?: Date;
}

export class ProjectLogDto extends BaseDto {
  @ApiPropertyOptional({ description: 'Project log ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'ID of the associated project' })
  @IsString()
  projectId: string;

  @ApiPropertyOptional({ description: 'Date of the last session' })
  @IsDate()
  @IsOptional()
  lastSessionDate?: Date;

  @ApiPropertyOptional({ description: 'Log entries', type: [ProjectLogEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectLogEntryDto)
  @IsOptional()
  logEntries?: ProjectLogEntryDto[];

  constructor(dto: Partial<ProjectLogDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
