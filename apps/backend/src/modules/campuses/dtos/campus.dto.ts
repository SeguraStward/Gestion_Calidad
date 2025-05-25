import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';

import { Status } from '@una-gc/database/prisma/generated/client';
import { BaseDto } from '@src/modules/generalDto';

export class CampusDto extends BaseDto {
  @ApiPropertyOptional({ description: 'Campus ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Code' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: 'Name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Regional Center ID' })
  @IsString()
  regionalCenterId: string;

  @ApiProperty({ description: 'Status of the campus', enum: Status })
  @IsEnum(Status)
  status: Status;

  constructor(dto: Partial<CampusDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
