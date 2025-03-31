import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsBoolean,
  IsDate,
  IsArray,
  ValidateNested,
  IsEmail,
} from 'class-validator';
import { Province, UserPermission, UserRole, UserStatus } from '@una-gc/database/prisma/generated/client';

export class UserEmailDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Email verification status' })
  @IsBoolean()
  isVerified: boolean;
}

export class UserPhoneDto {
  @ApiPropertyOptional({ description: 'Phone number' })
  @IsString()
  @IsOptional()
  number?: string;

  @ApiProperty({ description: 'Primary phone indicator' })
  @IsBoolean()
  isPrimary: boolean;
}

export class UserDto {
  @ApiPropertyOptional({ description: 'User ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Email information' })
  @ValidateNested()
  @Type(() => UserEmailDto)
  email: UserEmailDto;

  @ApiPropertyOptional({ description: 'National ID' })
  @IsString()
  @IsOptional()
  nationalId?: string;

  @ApiPropertyOptional({ description: 'Canton' })
  @IsString()
  @IsOptional()
  canton?: string;

  @ApiPropertyOptional({ description: 'District' })
  @IsString()
  @IsOptional()
  district?: string;

  @ApiPropertyOptional({ description: 'First name' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ description: 'Province', enum: Province })
  @IsEnum(Province)
  @IsOptional()
  province?: Province;

  @ApiPropertyOptional({ description: 'User role', enum: UserRole })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({ description: 'User condition' })
  @IsString()
  @IsOptional()
  condition?: string;

  @ApiPropertyOptional({ description: 'Address' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ description: 'User status', enum: UserStatus, default: UserStatus.ACTIVE })
  @IsEnum(UserStatus)
  status: UserStatus;

  @ApiPropertyOptional({ description: 'Hire date' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  hireDate?: Date;

  @ApiPropertyOptional({ description: 'Birth date' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  birthDate?: Date;

  @ApiPropertyOptional({ description: 'Photo URL' })
  @IsString()
  @IsOptional()
  photoUrl?: string;

  @ApiPropertyOptional({ description: 'Profile type' })
  @IsString()
  @IsOptional()
  profileType?: string;

  @ApiPropertyOptional({ description: 'Primary phone' })
  @IsString()
  @IsOptional()
  primaryPhone?: string;

  @ApiPropertyOptional({ description: 'Professional title' })
  @IsString()
  @IsOptional()
  professionalTitle?: string;

  @ApiPropertyOptional({ description: 'User permissions', enum: UserPermission, isArray: true })
  @IsArray()
  @IsEnum(UserPermission, { each: true })
  @IsOptional()
  permissions?: UserPermission[];

  @ApiPropertyOptional({ description: 'Phone numbers', type: [UserPhoneDto] })
  @ValidateNested({ each: true })
  @Type(() => UserPhoneDto)
  @IsOptional()
  phoneNumbers?: UserPhoneDto[];

  constructor(dto: Partial<UserDto> = {}) {
    Object.assign(this, dto);
  }
}
