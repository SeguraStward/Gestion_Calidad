import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsDate,
  IsEmail,
  IsMongoId,
  IsNumberString,
} from 'class-validator';

import { Type, Expose } from 'class-transformer';
import { Province, UserStatus } from '@una-gc/database/prisma/generated/client';
import { BaseDto } from '@src/modules/generalDto';
import { UserRoleDto } from '@src/modules/user-roles/dtos/user-role.dto';
import { UserPhoneDto } from './user-type.dto';

export class UserDto extends BaseDto {
  @ApiPropertyOptional({ description: 'User ID' })
  @IsString()
  @IsMongoId()
  @IsOptional()
  @Expose()
  id?: string;

  @ApiProperty({ description: 'User email address' })
  @IsString()
  @IsEmail()
  @Expose()
  email: string;

  @ApiProperty({ description: 'Full name' })
  @IsString()
  @Expose()
  fullName: string;

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

  @ApiPropertyOptional({ description: 'Professional title' })
  @IsString()
  @IsOptional()
  @Expose()
  professionalTitle?: string;

  @ApiPropertyOptional({ description: 'Hire date' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  @Expose()
  hireDate?: Date;

  @ApiPropertyOptional({ description: 'Condition' })
  @IsString()
  @IsOptional()
  @Expose()
  condition?: string;

  @ApiPropertyOptional({ description: 'Role IDs' })
  @IsArray()
  @IsString({ each: true })
  @IsMongoId({ each: true })
  @IsOptional()
  @Expose()
  roleIds?: string[];

  @ApiPropertyOptional({ type: () => UserRoleDto, description: 'Associated Roles' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserRoleDto)
  @Expose() // TODO
  roles?: UserRoleDto[];

  @ApiPropertyOptional({ description: 'User status', enum: UserStatus, default: 'ACTIVE' })
  @IsEnum(UserStatus)
  @IsOptional()
  @Expose()
  status?: UserStatus;

  constructor(dto: Partial<UserDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
