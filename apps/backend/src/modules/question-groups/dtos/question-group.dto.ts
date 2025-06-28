import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { AuditFields } from '@src/dtos/audit-fields.dto';
import { Status } from '@una-gc/database/prisma/generated/client';
import { Expose } from 'class-transformer';

export class QuestionGroupDto extends AuditFields {
  @ApiPropertyOptional({ description: 'QuestionGroup ID' })
  @IsString()
  @IsOptional()
  @Expose()
  id?: string;

  @ApiPropertyOptional({ description: 'Group name' })
  @IsString()
  @IsNotEmpty()
  @Expose()
  name: string;

  @ApiPropertyOptional({ description: 'Group title' })
  @IsString()
  @IsNotEmpty()
  @Expose()
  questionTitle: string;

  @ApiPropertyOptional({ description: 'Group description' })
  @IsString()
  @IsOptional()
  @Expose()
  description?: string;

  @ApiPropertyOptional({ enum: Status, default: Status.ACTIVE })
  @IsEnum(Status)
  @IsOptional()
  @Expose()
  status?: Status;

  constructor(dto: Partial<QuestionGroupDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
