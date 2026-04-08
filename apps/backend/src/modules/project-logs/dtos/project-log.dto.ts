import { Expose } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDate, IsOptional, IsString, ValidateNested } from 'class-validator';

import { AuditFields } from '@src/dtos/audit-fields.dto';
import { Type } from 'class-transformer';

export class ProjectLogEntryDto {
  @ApiProperty({ description: 'Version number', default: 0 })
  @IsOptional()
  version?: number;

  @ApiPropertyOptional({ description: 'User ID who updated the entry' })
  @Expose()
  @IsString()
  @IsOptional()
  updatedBy?: string;

  @ApiPropertyOptional({ description: 'Session ID reference' })
  @Expose()
  @IsString()
  @IsOptional()
  session?: string;

  @ApiPropertyOptional({ description: 'Review ID reference' })
  @Expose()
  @IsString()
  @IsOptional()
  review?: string;

  @ApiPropertyOptional({ description: 'Document ID reference' })
  @Expose()
  @IsString()
  @IsOptional()
  document?: string;

  @ApiPropertyOptional({ description: 'Note associated with the entry' })
  @Expose()
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ description: 'Date of the log entry', default: 'now()' })
  @Expose()
  @IsDate()
  @IsOptional()
  date?: Date;
}

export class ProjectLogDto extends AuditFields {
  @ApiPropertyOptional({ description: 'Project log ID' })
  @Expose()
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'ID of the associated project' })
  @Expose()
  @IsString()
  projectId: string;

  @ApiPropertyOptional({ description: 'Date of the last session' })
  @Expose()
  @IsDate()
  @IsOptional()
  lastSessionDate?: Date;

  @ApiPropertyOptional({ description: 'Log entries', type: [ProjectLogEntryDto] })
  @Expose()
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
