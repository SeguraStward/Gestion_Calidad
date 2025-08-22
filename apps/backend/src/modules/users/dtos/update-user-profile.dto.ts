import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Province, UserStatus } from '@una-gc/database/prisma/generated/client';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsEmail, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';

import { UserPhoneDto } from './user-type.dto';

export class UpdateUserProfileDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Full name' })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({ description: 'Full last name' })
  @IsString()
  @IsOptional()
  fullLastName?: string;

  @ApiPropertyOptional({ description: 'Photo URL' })
  @IsString()
  @IsOptional()
  photoUrl?: string;

  @ApiPropertyOptional({ description: 'National ID' })
  @IsString()
  @IsOptional()
  nationalId?: string;

  @ApiPropertyOptional({ description: 'Birth date' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  birthDate?: Date;

  @ApiPropertyOptional({ description: 'Primary phone' })
  @IsString()
  @IsOptional()
  primaryPhone?: string;

  @ApiPropertyOptional({ type: [UserPhoneDto], description: 'Additional phone numbers' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserPhoneDto)
  @IsOptional()
  phoneNumbers?: UserPhoneDto[];

  @ApiPropertyOptional({ description: 'Province', enum: Province })
  @IsEnum(Province)
  @IsOptional()
  province?: Province;

  @ApiPropertyOptional({ description: 'Canton' })
  @IsString()
  @IsOptional()
  canton?: string;

  @ApiPropertyOptional({ description: 'District' })
  @IsString()
  @IsOptional()
  district?: string;

  @ApiPropertyOptional({ description: 'Address' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: 'Professional title' })
  @IsString()
  @IsOptional()
  professionalTitle?: string;

  @ApiPropertyOptional({ description: 'Hire date' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  hireDate?: Date;

  @ApiPropertyOptional({ description: 'Condition' })
  @IsString()
  @IsOptional()
  condition?: string;

  @ApiPropertyOptional({ description: 'User status', enum: UserStatus })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
}
