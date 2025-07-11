import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';

import { AuditFields } from '@src/dtos/audit-fields.dto';
import { Status } from '@una-gc/database/prisma/generated/client';

export class TypeObservationDto {
  @ApiPropertyOptional({ description: 'Observation text' })
  @IsString()
  @IsOptional()
  observation?: string;

  @ApiPropertyOptional({ description: 'Observation date' })
  @IsDateString()
  @IsOptional()
  date?: Date;
}

export class ObservationDto extends AuditFields {
  @ApiPropertyOptional({ description: 'Observation ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Review ID' })
  @IsString()
  reviewId: string;

  @ApiPropertyOptional({ description: 'Session ID' })
  @IsString()
  @IsOptional()
  sessionId?: string;

  @ApiProperty({ description: 'Professor ID' })
  @IsString()
  professorId: string;

  @ApiProperty({ description: 'Observations list', type: [TypeObservationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TypeObservationDto)
  observations: TypeObservationDto[];

  @ApiPropertyOptional({ description: 'Status', enum: Status, default: Status.ACTIVE })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  constructor(dto: Partial<ObservationDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
