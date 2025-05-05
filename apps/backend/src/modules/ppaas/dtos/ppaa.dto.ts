import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EvidenceDto } from '@modules/general-types-dto';

export class PpaaDto {
  @ApiPropertyOptional({ description: 'Ppaa ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ description: 'Version', readOnly: true })
  @IsInt()
  @IsOptional()
  version?: number;

  @ApiProperty({ description: 'Activity name' })
  @IsString()
  activityName: string;

  @ApiProperty({ description: 'Activity type' })
  @IsString()
  activityType: string;

  @ApiProperty({ description: 'Activity date' })
  @IsString()
  activityDate: string;

  @ApiProperty({ description: 'Location' })
  @IsString()
  location: string;

  @ApiProperty({ description: 'Status' })
  @IsString()
  status: string;

  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Evidence', type: [EvidenceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvidenceDto)
  evidence: EvidenceDto[];

  constructor(dto: Partial<PpaaDto> = {}) {
    Object.assign(this, dto);
  }
}
