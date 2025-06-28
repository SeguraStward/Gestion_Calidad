import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { AuditFields } from '@src/dtos/audit-fields.dto';
import { Status } from '@una-gc/database/prisma/generated/client';
import { Expose } from 'class-transformer';

export class AcademicLoadGroupDto extends AuditFields {
  @ApiPropertyOptional({ description: 'AcademicLoadGroup ID' })
  @IsString()
  @IsOptional()
  @Expose()
  id?: string;

  @ApiProperty({ description: 'Group number' })
  @IsString()
  @Expose()
  number: string;

  @ApiProperty({ description: 'Status', enum: Status })
  @IsEnum(Status)
  status: Status;

  constructor(dto: Partial<AcademicLoadGroupDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
