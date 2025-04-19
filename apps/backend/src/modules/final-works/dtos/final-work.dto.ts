import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsDate, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class FinalWorkEvidenceDto {
  @ApiProperty({ description: 'Download link' })
  @IsString()
  download: string;

  @ApiProperty({ description: 'File ID' })
  @IsString()
  fileId: string;

  @ApiPropertyOptional({ description: 'Link' })
  @IsString()
  @IsOptional()
  link?: string;

  @ApiPropertyOptional({ description: 'Name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Evidence type' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'URI' })
  @IsString()
  uri: string;
}

export class FinalWorkDto {
  @ApiPropertyOptional({ description: 'FinalWork ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Status' })
  @IsString()
  status: string;

  @ApiProperty({ description: 'Type' })
  @IsString()
  type: string;

  @ApiPropertyOptional({ description: 'Date' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  date?: Date;

  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ description: 'Version', default: 0 })
  @IsInt()
  @IsOptional()
  version?: number = 0;

  @ApiProperty({ description: 'Evidence', type: [FinalWorkEvidenceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FinalWorkEvidenceDto)
  evidence: FinalWorkEvidenceDto[];

  constructor(dto: Partial<FinalWorkDto> = {}) {
    Object.assign(this, dto);
  }
}
