import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

import { AuditFields } from '@src/dtos/audit-fields.dto';
import { EvidenceDto } from '@src/dtos/general-types.dto';
import { Status } from '@una-gc/database/prisma/generated/client';
import { Type } from 'class-transformer';

export class PpaaDto extends AuditFields {
  @ApiPropertyOptional({ description: 'Ppaa ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Activity name' })
  @IsString()
  activityName: string;

  @ApiProperty({ description: 'Activity type' })
  @IsString()
  activityType: string;

  @ApiProperty({ description: 'Activity date' })
  @IsInt()
  activityDate: Date;

  @ApiProperty({ description: 'Location' })
  @IsString()
  location: string;

  @ApiProperty({ description: 'Status', enum: Status })
  @IsEnum(Status)
  status: Status;

  @ApiProperty({ description: 'Evidence', type: [EvidenceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvidenceDto)
  evidence: EvidenceDto[];

  constructor(dto: Partial<PpaaDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
