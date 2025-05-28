import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';

import { ResponseType } from '@una-gc/database/prisma/generated/client'; // for Prisma enum
import { BaseDto } from '@src/modules/generalDto';
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

export class QuestionDto extends BaseDto {
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

  constructor(dto: Partial<QuestionDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
