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
} from 'class-validator';

import { Type, Expose } from 'class-transformer'; // Import Expose
import { Province, UserStatus } from '@una-gc/database/prisma/generated/client';
import { BaseDto } from '@src/modules/generalDto';

class UserPhoneDto {
  @ApiProperty({ description: 'Phone number' })
  @IsString()
  @Expose() // Added Expose
  number: string;

  @ApiProperty({ description: 'Phone type' })
  @IsString()
  @Expose() // Added Expose
  type: string;
}

export class UserDto extends BaseDto {
  @ApiPropertyOptional({ description: 'User ID' })
  @IsString()
  @IsMongoId()
  @IsOptional()
  @Expose() // Added Expose
  id?: string;

  @ApiProperty({ description: 'User email address' })
  @IsString()
  @IsEmail()
  @Expose() // Added Expose
  email: string;

  @ApiProperty({ description: 'Full name' })
  @IsString()
  @Expose() // Added Expose
  fullName: string;

  @ApiPropertyOptional({ description: 'Full last name' })
  @IsString()
  @IsOptional()
  @Expose() // Added Expose
  fullLastName?: string;

  @ApiPropertyOptional({ description: 'Photo URL' })
  @IsString()
  @IsOptional()
  @Expose() // Added Expose
  photoUrl?: string;

  @ApiPropertyOptional({ description: 'National ID' })
  @IsString()
  @IsOptional()
  @Expose() // Added Expose
  nationalId?: string;

  @ApiPropertyOptional({ description: 'Birth date' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  @Expose() // Added Expose
  birthDate?: Date;

  @ApiPropertyOptional({ description: 'Primary phone' })
  @IsString()
  @IsOptional()
  @Expose() // Added Expose
  primaryPhone?: string;

  @ApiPropertyOptional({ description: 'Phone numbers', type: [UserPhoneDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserPhoneDto)
  @IsOptional()
  @Expose() // Added Expose
  phoneNumbers?: UserPhoneDto[];

  @ApiPropertyOptional({ description: 'Province', enum: Province })
  @IsEnum(Province)
  @IsOptional()
  @Expose() // Added Expose
  province?: Province;

  @ApiPropertyOptional({ description: 'Canton' })
  @IsString()
  @IsOptional()
  @Expose() // Added Expose
  canton?: string;

  @ApiPropertyOptional({ description: 'District' })
  @IsString()
  @IsOptional()
  @Expose() // Added Expose
  district?: string;

  @ApiPropertyOptional({ description: 'Address' })
  @IsString()
  @IsOptional()
  @Expose() // Added Expose
  address?: string;

  @ApiPropertyOptional({ description: 'Professional title' })
  @IsString()
  @IsOptional()
  @Expose() // Added Expose
  professionalTitle?: string;

  @ApiPropertyOptional({ description: 'Hire date' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  @Expose() // Added Expose
  hireDate?: Date;

  @ApiPropertyOptional({ description: 'Condition' })
  @IsString()
  @IsOptional()
  @Expose() // Added Expose
  condition?: string;

  @ApiPropertyOptional({ description: 'Role IDs' })
  @IsArray()
  @IsString({ each: true })
  @IsMongoId({ each: true })
  @IsOptional()
  @Expose() // Added Expose
  roleIds?: string[];

  @ApiPropertyOptional({ description: 'Google ID' })
  @IsString()
  @IsOptional()
  @Expose() // Added Expose
  googleId?: string;

  @ApiPropertyOptional({ description: 'User status', enum: UserStatus, default: 'ACTIVE' })
  @IsEnum(UserStatus)
  @IsOptional()
  @Expose() // Added Expose
  status?: UserStatus;

  // BaseDto properties like version, createdAt, updatedAt, createdBy, updatedBy
  // should also have @Expose() if they are defined in BaseDto and you want them in the output.
  // If BaseDto already handles this, then no changes needed for those inherited properties here.

  constructor(dto: Partial<UserDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
