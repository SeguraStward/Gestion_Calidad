import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Status } from '@una-gc/database/prisma/generated/client'; // Import for Status enum
import { EvidenceDto } from '../../general-types-dto'; // Adjust path as needed

export class UserLanguageDto {
  @ApiPropertyOptional({ description: 'UserLanguage ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ description: 'Version', readOnly: true })
  @IsInt()
  @IsOptional()
  version?: number;

  @ApiProperty({ description: 'Language name' })
  @IsString()
  language: string;

  @ApiProperty({ description: 'Language type' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Speaking proficiency level' })
  @IsInt()
  speaking: number;

  @ApiProperty({ description: 'Writing proficiency level' })
  @IsInt()
  writing: number;

  @ApiProperty({ description: 'Reading proficiency level' })
  @IsInt()
  reading: number;

  @ApiProperty({ description: 'Status', enum: Status })
  @IsEnum(Status)
  status: Status;

  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Language evidence', type: [EvidenceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvidenceDto)
  evidence: EvidenceDto[];

  constructor(dto: Partial<UserLanguageDto> = {}) {
    Object.assign(this, dto);
  }
}
