import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested, IsBoolean, IsInt, Min } from 'class-validator';

import { AuditFields } from '@src/dtos/audit-fields.dto';
import { ResponseType, Status } from '@una-gc/database/prisma/generated/client';
import { Type } from 'class-transformer';

export class QuestionOptionDto {
  @ApiPropertyOptional({ description: 'Option category' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiPropertyOptional({ description: 'Option label' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiPropertyOptional({ description: 'Option value' })
  @IsString()
  @IsNotEmpty()
  value: string;
}

export class QuestionDto extends AuditFields {
  @ApiPropertyOptional({ description: 'Question ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ description: 'Group ID' })
  @IsString()
  @IsOptional()
  groupId?: string;

  @ApiPropertyOptional({ description: 'Module name' })
  @IsString()
  @IsOptional()
  module?: string;

  @ApiPropertyOptional({ description: 'Question text' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiPropertyOptional({ description: 'Question options', type: [QuestionOptionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  @IsOptional()
  options?: QuestionOptionDto[];

  @ApiPropertyOptional({ description: 'Response type', enum: ResponseType })
  @IsEnum(ResponseType)
  @IsNotEmpty()
  responseType: ResponseType;

  @ApiPropertyOptional({ description: 'Question version' })
  @IsString()
  @IsOptional()
  questionVersion?: string;

  @ApiPropertyOptional({ description: 'Step number (5 or 7 for final report steps)' })
  @IsInt()
  @Min(1)
  @IsOptional()
  stepNumber?: number;

  @ApiPropertyOptional({ description: 'Report types this question applies to', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  appliesTo?: string[];

  @ApiPropertyOptional({ description: 'Additional description for the question' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Whether this question is required', default: true })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiPropertyOptional({ description: 'Order within the step/group' })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({ enum: Status, default: Status.ACTIVE })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  constructor(dto: Partial<QuestionDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
