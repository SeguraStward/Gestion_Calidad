import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { AuditFields } from '@src/dtos/audit-fields.dto';
import { SchoolDto } from '@src/modules/schools/dtos/school.dto';
import { Status } from '@una-gc/database/prisma/generated/client';

export class FacultyDto extends AuditFields {
  @Expose()
  @ApiPropertyOptional({ description: 'Faculty ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @Expose()
  @ApiProperty({ description: 'Faculty code' })
  @IsString()
  code: string;

  @Expose()
  @ApiProperty({ description: 'Description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Name' })
  @IsString()
  @IsOptional()
  name?: string;

  @Expose()
  @ApiProperty({ description: 'Status of the faculty', enum: Status, default: Status.ACTIVE })
  @IsEnum(Status)
  status: Status;

  @Expose()
  @ApiPropertyOptional({ type: () => [SchoolDto] })
  @Type(() => SchoolDto)
  @IsOptional()
  schools?: SchoolDto[];

  constructor(dto: Partial<FacultyDto> = {}) {
    super();
    Object.assign(this, dto);
    if (dto && Array.isArray((dto as any).schools)) {
      this.schools = (dto as any).schools;
    }
  }
}
