import { Expose } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

import { AuditFields } from '@src/dtos/audit-fields.dto';
import { DataType } from '@una-gc/database/prisma/generated/client';

export class ParameterDto extends AuditFields {
  @ApiPropertyOptional({ description: 'Parameter ID' })
  @IsString()
  @IsOptional()
  @Expose()
  id?: string;

  @ApiProperty({ description: 'Parameter name', example: 'MAX_FILE_SIZE' })
  @IsString()
  @Expose()
  name: string;

  @ApiProperty({ description: 'Parameter value (stored as string)', example: '10485760' })
  @IsString()
  @Expose()
  value: string;

  @ApiPropertyOptional({ description: 'Parameter description' })
  @IsString()
  @IsOptional()
  @Expose()
  description?: string;

  @ApiProperty({ description: 'Data type', enum: DataType, example: DataType.NUMBER })
  @IsEnum(DataType)
  @Expose()
  dataType: DataType;

  @ApiPropertyOptional({ description: 'Is parameter active', default: true })
  @IsBoolean()
  @IsOptional()
  @Expose()
  isActive?: boolean;

  constructor(dto: Partial<ParameterDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
