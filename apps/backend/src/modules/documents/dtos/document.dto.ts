import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { AuditFields } from '@src/dtos/audit-fields.dto';
import { Status } from '@una-gc/database/prisma/generated/client';

export class DocumentDto extends AuditFields {
  @ApiPropertyOptional({ description: 'Document ID' })
  @Expose()
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ description: 'Document number' })
  @Expose()
  @IsString()
  documentNumber?: string;

  @ApiProperty({ description: 'Project ID' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({ description: 'CommSession ID' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiPropertyOptional({ description: 'Students information' })
  @Expose()
  @IsString()
  @IsOptional()
  students?: string;

  @ApiPropertyOptional({ description: 'Career name' })
  @Expose()
  @IsString()
  @IsOptional()
  careerName?: string;

  @ApiPropertyOptional({ description: 'Commission name' })
  @Expose()
  @IsString()
  @IsOptional()
  commissionName?: string;

  @ApiPropertyOptional({ description: 'Coordinator name' })
  @Expose()
  @IsString()
  @IsOptional()
  coordinatorName?: string;

  @ApiPropertyOptional({ description: 'Regional center name' })
  @Expose()
  @IsString()
  @IsOptional()
  regionalCenterName?: string;

  @ApiPropertyOptional({ description: 'Document status', enum: Status, default: Status.ACTIVE })
  @Expose()
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  constructor(dto: Partial<DocumentDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
