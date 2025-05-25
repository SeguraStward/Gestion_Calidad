import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsDate,
  IsEmail,
  IsMongoId,
} from 'class-validator';

import { Type } from 'class-transformer';
import { Province, Status } from '@una-gc/database/prisma/generated/client';
import { BaseDto } from '@src/modules/generalDto';

class UserPhoneDto {
  @ApiProperty({ description: 'Phone number' })
  @IsString()
  number: string;

  @ApiProperty({ description: 'Phone type' })
  @IsString()
  type: string;
}

export class UserDto extends BaseDto {
  @ApiPropertyOptional({ description: 'User ID' })
  @IsString()
  @IsMongoId()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'User email address' })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Email verification status' })
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @ApiProperty({ description: 'Full name' })
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'Full last name' })
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

  @ApiPropertyOptional({ description: 'Phone numbers', type: [UserPhoneDto] })
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

  @ApiPropertyOptional({ description: 'Role IDs' })
  @IsArray()
  @IsString({ each: true })
  @IsMongoId({ each: true })
  @IsOptional()
  roleIds?: string[];

  @ApiPropertyOptional({ description: 'Profile types', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  profileTypes?: string[];

  @ApiPropertyOptional({ description: 'Google ID' })
  @IsString()
  @IsOptional()
  googleId?: string;

  @ApiPropertyOptional({ description: 'Student project IDs' })
  @IsArray()
  @IsString({ each: true })
  @IsMongoId({ each: true })
  @IsOptional()
  studentProjectIds?: string[];

  @ApiPropertyOptional({ description: 'User status', enum: Status, default: 'ACTIVE' })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  constructor(dto: Partial<UserDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
