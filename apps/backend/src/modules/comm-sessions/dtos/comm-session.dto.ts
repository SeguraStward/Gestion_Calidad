import { Expose } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

import { AuditFields } from '@src/dtos/audit-fields.dto';
import { CommSessionStage, ProjectCommSessionStatus, Status } from '@una-gc/database/prisma/generated/client';

export class ProjectCommSessionDto {
  @ApiProperty({ description: 'Review ID' })
  @Expose()
  @IsString()
  review: string;

  @ApiProperty({
    description: 'Project status in session',
    enum: ProjectCommSessionStatus,
    default: ProjectCommSessionStatus.PENDING,
  })
  @Expose()
  @IsEnum(ProjectCommSessionStatus)
  @IsOptional()
  status?: ProjectCommSessionStatus;

  @ApiPropertyOptional({ description: 'Project type' })
  @Expose()
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ description: 'Agreement details' })
  @Expose()
  @IsString()
  @IsOptional()
  agreement?: string;

  @ApiPropertyOptional({ description: 'Tutor ID' })
  @Expose()
  @IsString()
  @IsOptional()
  tutor?: string;

  @ApiPropertyOptional({ description: 'Internal reader ID' })
  @Expose()
  @IsString()
  @IsOptional()
  internalReader?: string;

  @ApiPropertyOptional({ description: 'External reader ID' })
  @Expose()
  @IsString()
  @IsOptional()
  externalReader?: string;

  @ApiProperty({ description: 'Notification sent status', default: false })
  @Expose()
  @IsBoolean()
  @IsOptional()
  notificationSent?: boolean;
}

export class CommSessionDto extends AuditFields {
  @ApiPropertyOptional({ description: 'CommSession ID' })
  @Expose()
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Commission ID' })
  @Expose()
  @IsString()
  commissionId: string;

  @ApiPropertyOptional({ description: 'Session URL' })
  @IsUrl()
  @IsOptional()
  url?: string;

  @ApiProperty({ description: 'Session number' })
  @Expose()
  @IsInt()
  sessionNumber: number;

  @ApiPropertyOptional({ description: 'Closing date' })
  @Expose()
  @IsDate()
  @IsOptional()
  closingDate?: Date;

  @ApiPropertyOptional({ description: 'Projects in this session', type: [ProjectCommSessionDto] })
  @Expose()
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
  @Expose()
  @IsEnum(CommSessionStage)
  @IsOptional()
  stage?: CommSessionStage;

  @ApiPropertyOptional({ description: 'Session status', enum: Status, default: Status.ACTIVE })
  @Expose()
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  constructor(dto: Partial<CommSessionDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
