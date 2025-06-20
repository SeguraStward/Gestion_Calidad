import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';

import { DataType } from '@una-gc/database/prisma/generated/client';
import { BaseDto } from '@src/modules/generalDto';

export class ParameterDto extends BaseDto {
  @ApiPropertyOptional({ description: 'Parameter ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Parameter name', example: 'MAX_FILE_SIZE' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Parameter value (stored as string)', example: '10485760' })
  @IsString()
  value: string;

  @ApiPropertyOptional({ description: 'Parameter description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Data type', enum: DataType, example: DataType.NUMBER })
  @IsEnum(DataType)
  dataType: DataType;

  @ApiPropertyOptional({ description: 'Is parameter active', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  constructor(dto: Partial<ParameterDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
