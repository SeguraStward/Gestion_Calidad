import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, IsArray, ValidateNested } from 'class-validator';

import { Type } from 'class-transformer';
import { Status } from '@una-gc/database/prisma/generated/client';
import { EvidenceDto } from '@modules/general-types-dto';
import { BaseDto } from '@src/modules/generalDto';

export class PpaaDto extends BaseDto {
  @ApiPropertyOptional({ description: 'Ppaa ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Activity name' })
  @IsString()
  activityName: string;

  @ApiProperty({ description: 'Activity type' })
  @IsString()
  activityType: string;

  @ApiProperty({ description: 'Activity date' })
  @IsInt()
  activityDate: Date;

  @ApiProperty({ description: 'Location' })
  @IsString()
  location: string;

  @ApiProperty({ description: 'Status', enum: Status })
  @IsEnum(Status)
  status: Status;

  @ApiProperty({ description: 'Evidence', type: [EvidenceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvidenceDto)
  evidence: EvidenceDto[];

  constructor(dto: Partial<PpaaDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
