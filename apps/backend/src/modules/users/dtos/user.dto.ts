import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsInt,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsDate,
  IsEmail,
} from 'class-validator';
import { Province, UserPermission, UserRole, Status } from '@una-gc/database/prisma/generated/client';

class UserPhoneDto {
  @ApiPropertyOptional({ description: 'Phone number' })
  @IsString()
  @IsOptional()
  number?: string;

  @ApiPropertyOptional({ description: 'Is primary phone number' })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean = false;
}
export class UserDto {
  @ApiPropertyOptional({ description: 'User ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ description: 'Version', readOnly: true })
  @IsInt()
  @IsOptional()
  version?: number;

  @ApiProperty({ description: 'User email address' })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Email verification status' })
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean = false;

  @ApiProperty({ description: 'Full name' })
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'Full last name' })
  @IsString()
  fullLastName: string;

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

  @ApiPropertyOptional({ description: 'User roles', enum: UserRole, isArray: true })
  @IsEnum(UserRole, { each: true })
  @IsArray()
  @IsOptional()
  roles?: UserRole[];

  @ApiPropertyOptional({ description: 'User permissions', enum: UserPermission, isArray: true })
  @IsEnum(UserPermission, { each: true })
  @IsArray()
  @IsOptional()
  permissions?: UserPermission[];

  @ApiPropertyOptional({ description: 'Profile types', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  profileTypes?: string[];

  @ApiPropertyOptional({ description: 'User status', enum: Status, default: 'ACTIVE' })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @ApiPropertyOptional({ description: 'Google ID' })
  @IsString()
  @IsOptional()
  googleId?: string;

  @ApiPropertyOptional({ description: 'Creation date', readOnly: true })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  createdAt?: Date;

  @ApiPropertyOptional({ description: 'Last update date', readOnly: true })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  updatedAt?: Date;

  constructor(dto: Partial<UserDto> = {}) {
    Object.assign(this, dto);
  }
}
