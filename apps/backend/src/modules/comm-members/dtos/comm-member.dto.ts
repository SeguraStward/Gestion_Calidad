import { Expose } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { AuditFields } from '@src/dtos/audit-fields.dto';
import { Status } from '@una-gc/database/prisma/generated/client';

export class CommMemberDto extends AuditFields {
  @ApiPropertyOptional({ description: 'CommMember ID' })
  @Expose()
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'User ID' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({ description: 'Workload information' })
  @Expose()
  @IsString()
  @IsOptional()
  workload?: string;

  @ApiProperty({ description: 'Commission ID' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  commissionId: string;

  @ApiPropertyOptional({ description: 'CommMember status', enum: Status, default: Status.ACTIVE })
  @Expose()
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  constructor(dto: Partial<CommMemberDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
