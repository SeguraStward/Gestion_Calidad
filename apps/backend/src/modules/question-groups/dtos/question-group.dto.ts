import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsArray, IsInt, Min } from 'class-validator';

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

  @ApiPropertyOptional({ description: 'Step number (5 or 7 for final report steps)' })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Expose()
  stepNumber?: number;

  @ApiPropertyOptional({ description: 'Report types this group applies to', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Expose()
  appliesTo?: string[];

  @ApiPropertyOptional({ description: 'Order within the step' })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Expose()
  order?: number;

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
