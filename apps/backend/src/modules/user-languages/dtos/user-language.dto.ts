import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuditFields } from '@src/dtos/audit-fields.dto';
import { EvidenceDto } from '@src/dtos/general-types.dto';
import { Status } from '@una-gc/database/prisma/generated/client';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

export class UserLanguageDto extends AuditFields {
  @ApiPropertyOptional({ description: 'UserLanguage ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

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

  @ApiProperty({ description: 'Language evidence', type: [EvidenceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvidenceDto)
  evidence: EvidenceDto[];

  constructor(dto: Partial<UserLanguageDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
