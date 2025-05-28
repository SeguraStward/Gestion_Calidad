import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

import { BaseDto } from '@src/modules/generalDto';

export class QuestionGroupDto extends BaseDto {
  @ApiPropertyOptional({ description: 'QuestionGroup ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ description: 'Group name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Group title' })
  @IsString()
  @IsNotEmpty()
  Title: string;

  @ApiPropertyOptional({ description: 'Group description' })
  @IsString()
  @IsOptional()
  description?: string;

  constructor(dto: Partial<QuestionGroupDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
