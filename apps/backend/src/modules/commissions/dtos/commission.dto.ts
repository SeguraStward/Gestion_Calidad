import { Expose } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { AuditFields } from '@src/dtos/audit-fields.dto';
import { Status } from '@una-gc/database/prisma/generated/client'; // Added Status import

export class CommissionDto extends AuditFields {
  @ApiPropertyOptional({ description: 'Commission ID' })
  @Expose()
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Commission type' })
  @Expose()
  @IsString()
  type: string;

  @ApiProperty({ description: 'Commission name' })
  @Expose()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Coordinator ID' })
  @Expose()
  @IsString()
  @IsOptional()
  coordinatorId?: string;

  @ApiProperty({ description: 'Regional Center ID' })
  @Expose()
  @IsString()
  regionalCenterId: string;

  @ApiProperty({ description: 'Status of the commission', enum: Status })
  @Expose()
  @IsEnum(Status)
  status: Status;

  constructor(dto: Partial<CommissionDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
