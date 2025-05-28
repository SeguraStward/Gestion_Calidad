import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNotEmpty } from 'class-validator';

import { Status } from '@una-gc/database/prisma/generated/client'; // import for Prisma enum
import { BaseDto } from '@src/modules/generalDto';

export class RegionalCenterDto extends BaseDto {
  @ApiPropertyOptional({ description: 'RegionalCenter ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Regional Center code', example: 'RC-001' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Regional Center name', example: 'Pacific Regional Center' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Regional Center status', enum: Status, default: Status.ACTIVE })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  constructor(dto: Partial<RegionalCenterDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
