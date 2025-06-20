import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsDate, IsNotEmpty } from 'class-validator';

import { Status } from '@una-gc/database/prisma/generated/client';
import { BaseDto } from '@src/modules/generalDto';
import { Type } from 'class-transformer';

export class ProjectReviewDto extends BaseDto {
  @ApiPropertyOptional({ description: 'ProjectReview ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Commission ID' })
  @IsString()
  @IsNotEmpty()
  commissionId: string;

  @ApiProperty({ description: 'Project ID' })
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({ description: 'Professor ID' })
  @IsString()
  @IsNotEmpty()
  professorId: string;

  @ApiPropertyOptional({ description: 'Submission date of the review' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  submissionDate?: Date;

  @ApiPropertyOptional({ description: 'Status of the project review', enum: Status, default: Status.ACTIVE })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  constructor(dto: Partial<ProjectReviewDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
