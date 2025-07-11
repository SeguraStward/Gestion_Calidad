import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDate,
  IsEmail,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { AuditFields } from '@src/dtos/audit-fields.dto';
import { Province } from '@una-gc/database/prisma/generated/client';
import { Expose, Type } from 'class-transformer';
import { UserPhoneDto } from './user-type.dto';

export class MeUpdateUserDto extends AuditFields {
  @ApiPropertyOptional({ description: 'Full name' })
  @IsString()
  @IsOptional()
  @Expose()
  fullName?: string;

  @ApiPropertyOptional({ description: 'Full last name' })
  @IsString()
  @IsOptional()
  @Expose()
  fullLastName?: string;

  @ApiPropertyOptional({ description: 'Photo URL' })
  @IsString()
  @IsOptional()
  @Expose()
  photoUrl?: string;

  @ApiPropertyOptional({ description: 'User email address' })
  @IsString()
  @IsEmail()
  @IsOptional()
  @Expose()
  email?: string;

  @ApiPropertyOptional({ description: 'National ID' })
  @IsString()
  @IsOptional()
  @IsNumberString()
  @Expose()
  nationalId?: string;

  @ApiPropertyOptional({ description: 'Birth date' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  @Expose()
  birthDate?: Date;

  @ApiPropertyOptional({ description: 'Primary phone' })
  @IsString()
  @IsOptional()
  @IsNumberString()
  @Expose()
  primaryPhone?: string;

  @ApiPropertyOptional({ description: 'Phone numbers', type: [UserPhoneDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserPhoneDto)
  @IsOptional()
  @Expose()
  phoneNumbers?: UserPhoneDto[];

  @ApiPropertyOptional({ description: 'Province', enum: Province })
  @IsEnum(Province)
  @IsOptional()
  @Expose()
  province?: Province;

  @ApiPropertyOptional({ description: 'Canton' })
  @IsString()
  @IsOptional()
  @Expose()
  canton?: string;

  @ApiPropertyOptional({ description: 'District' })
  @IsString()
  @IsOptional()
  @Expose()
  district?: string;

  @ApiPropertyOptional({ description: 'Address' })
  @IsString()
  @IsOptional()
  @Expose()
  address?: string;

  constructor(dto: Partial<MeUpdateUserDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
