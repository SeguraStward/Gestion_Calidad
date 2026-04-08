import { Expose } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuditFields } from '@src/dtos/audit-fields.dto';
import { EvidenceDto } from '@src/dtos/general-types.dto';
import { Status } from '@una-gc/database/prisma/generated/client';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

export class UserLanguageDto extends AuditFields {
  @ApiPropertyOptional({ description: 'UserLanguage ID' })
  @Expose()
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'User ID' })
  @Expose()
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Language name' })
  @Expose()
  @IsString()
  language: string;

  @ApiProperty({ description: 'Language type' })
  @Expose()
  @IsString()
  type: string;

  @ApiProperty({ description: 'Speaking proficiency level' })
  @Expose()
  @IsInt()
  speaking: number;

  @ApiProperty({ description: 'Writing proficiency level' })
  @Expose()
  @IsInt()
  writing: number;

  @ApiProperty({ description: 'Reading proficiency level' })
  @Expose()
  @IsInt()
  reading: number;

  @ApiProperty({ description: 'Status', enum: Status })
  @Expose()
  @IsEnum(Status)
  status: Status;

  @ApiProperty({ description: 'Language evidence', type: [EvidenceDto] })
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvidenceDto)
  evidence: EvidenceDto[];

  constructor(dto: Partial<UserLanguageDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
