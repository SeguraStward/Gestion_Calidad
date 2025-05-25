import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNotEmpty } from 'class-validator';

import { Status } from '@una-gc/database/prisma/generated/client';
import { BaseDto } from '@src/modules/generalDto';

export class DocumentDto extends BaseDto {
  @ApiPropertyOptional({ description: 'Document ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ description: 'Document number' })
  @IsString()
  documentNumber?: string;

  @ApiProperty({ description: 'Project ID' })
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({ description: 'CommSession ID' })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiPropertyOptional({ description: 'Students information' })
  @IsString()
  @IsOptional()
  students?: string;

  @ApiPropertyOptional({ description: 'Career name' })
  @IsString()
  @IsOptional()
  careerName?: string;

  @ApiPropertyOptional({ description: 'Commission name' })
  @IsString()
  @IsOptional()
  commissionName?: string;

  @ApiPropertyOptional({ description: 'Coordinator name' })
  @IsString()
  @IsOptional()
  coordinatorName?: string;

  @ApiPropertyOptional({ description: 'Regional center name' })
  @IsString()
  @IsOptional()
  regionalCenterName?: string;

  @ApiPropertyOptional({ description: 'Document status', enum: Status, default: Status.ACTIVE })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  constructor(dto: Partial<DocumentDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
