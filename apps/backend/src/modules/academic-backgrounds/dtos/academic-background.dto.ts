import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Status } from '@una-gc/database/prisma/generated/client'; // Import for Status enum
import { EvidenceDto } from '../../general-types-dto'; // Adjust path as needed

export class AcademicBackgroundDto {
  @ApiPropertyOptional({ description: 'AcademicBackground ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ description: 'Version', readOnly: true })
  @IsInt()
  @IsOptional()
  version?: number;

  @ApiProperty({ description: 'Academic degree' })
  @IsString()
  degree: string;

  @ApiProperty({ description: 'Observations' })
  @IsString()
  observations: string;

  @ApiProperty({ description: 'Status', enum: Status })
  @IsEnum(Status)
  status: Status;

  @ApiProperty({ description: 'Date' })
  @IsString()
  date: string;

  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Institution name' })
  @IsString()
  institution: string;

  @ApiProperty({ description: 'Institution type' })
  @IsString()
  InstitutionType: string;

  @ApiProperty({ description: 'Language evidence', type: [EvidenceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvidenceDto)
  evidence: EvidenceDto[];

  constructor(dto: Partial<AcademicBackgroundDto> = {}) {
    Object.assign(this, dto);
  }
}
