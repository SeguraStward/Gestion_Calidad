import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNotEmpty } from 'class-validator';

import { Status } from '@una-gc/database/prisma/generated/client';
import { BaseDto } from '@src/modules/generalDto';

export class CommMemberDto extends BaseDto {
  @ApiPropertyOptional({ description: 'CommMember ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'User ID' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({ description: 'Workload information' })
  @IsString()
  @IsOptional()
  workload?: string;

  @ApiProperty({ description: 'Commission ID' })
  @IsString()
  @IsNotEmpty()
  commissionId: string;

  @ApiPropertyOptional({ description: 'CommMember status', enum: Status, default: Status.ACTIVE })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  constructor(dto: Partial<CommMemberDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
