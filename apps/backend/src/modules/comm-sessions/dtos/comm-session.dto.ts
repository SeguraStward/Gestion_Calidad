import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  IsDate,
  IsArray,
  IsBoolean,
  ValidateNested,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';

import { CommSessionStage, ProjectCommSessionStatus, Status } from '@una-gc/database/prisma/generated/client';
import { BaseDto } from '@src/modules/generalDto';

export class ProjectCommSessionDto {
  @ApiProperty({ description: 'Review ID' })
  @IsString()
  review: string;

  @ApiProperty({
    description: 'Project status in session',
    enum: ProjectCommSessionStatus,
    default: ProjectCommSessionStatus.PENDING,
  })
  @IsEnum(ProjectCommSessionStatus)
  @IsOptional()
  status?: ProjectCommSessionStatus;

  @ApiPropertyOptional({ description: 'Project type' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ description: 'Agreement details' })
  @IsString()
  @IsOptional()
  agreement?: string;

  @ApiPropertyOptional({ description: 'Tutor ID' })
  @IsString()
  @IsOptional()
  tutor?: string;

  @ApiPropertyOptional({ description: 'Internal reader ID' })
  @IsString()
  @IsOptional()
  internalReader?: string;

  @ApiPropertyOptional({ description: 'External reader ID' })
  @IsString()
  @IsOptional()
  externalReader?: string;

  @ApiProperty({ description: 'Notification sent status', default: false })
  @IsBoolean()
  @IsOptional()
  notificationSent?: boolean;
}

export class CommSessionDto extends BaseDto {
  @ApiPropertyOptional({ description: 'CommSession ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Commission ID' })
  @IsString()
  commissionId: string;

  @ApiPropertyOptional({ description: 'Session URL' })
  @IsUrl()
  @IsOptional()
  url?: string;

  @ApiProperty({ description: 'Session number' })
  @IsInt()
  sessionNumber: number;

  @ApiPropertyOptional({ description: 'Closing date' })
  @IsDate()
  @IsOptional()
  closingDate?: Date;

  @ApiPropertyOptional({ description: 'Projects in this session', type: [ProjectCommSessionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectCommSessionDto)
  @IsOptional()
  projects?: ProjectCommSessionDto[];

  @ApiPropertyOptional({
    description: 'Session stage',
    enum: CommSessionStage,
    default: CommSessionStage.STARTED,
  })
  @IsEnum(CommSessionStage)
  @IsOptional()
  stage?: CommSessionStage;

  @ApiPropertyOptional({ description: 'Session status', enum: Status, default: Status.ACTIVE })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  constructor(dto: Partial<CommSessionDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
