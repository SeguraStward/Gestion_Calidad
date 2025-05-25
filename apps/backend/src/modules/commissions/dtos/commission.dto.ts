import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';

import { Status } from '@una-gc/database/prisma/generated/client'; // Added Status import
import { BaseDto } from '@src/modules/generalDto';

export class CommissionDto extends BaseDto {
  @ApiPropertyOptional({ description: 'Commission ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Commission type' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Commission name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Coordinator ID' })
  @IsString()
  @IsOptional()
  coordinatorId?: string;

  @ApiProperty({ description: 'Regional Center ID' })
  @IsString()
  regionalCenterId: string;

  @ApiProperty({ description: 'Status of the commission', enum: Status })
  @IsEnum(Status)
  status: Status;

  constructor(dto: Partial<CommissionDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
