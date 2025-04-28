import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsEnum } from 'class-validator';
import { Status } from '@una-gc/database/prisma/generated/client';

export class CampusDto {
  @ApiPropertyOptional({ description: 'Campus ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ description: 'Version', readOnly: true })
  @IsInt()
  @IsOptional()
  version?: number;

  @ApiProperty({ description: 'Code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Status of the campus', enum: Status })
  @IsEnum(Status)
  status: Status;

  @ApiPropertyOptional({ description: 'Name' })
  @IsString()
  @IsOptional()
  name?: string;

  constructor(dto: Partial<CampusDto> = {}) {
    Object.assign(this, dto);
  }
}
