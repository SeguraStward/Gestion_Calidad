import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsOptional, IsString, ValidateNested } from 'class-validator';
import { IsUniversityEmail } from '@modules/users/validators/is-university-email.validator';

export class UpdateUserEmailDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  @IsUniversityEmail()
  email: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'First name' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ description: 'Email information' })
  @ValidateNested()
  @Type(() => UpdateUserEmailDto)
  @IsOptional()
  email?: UpdateUserEmailDto;

  @ApiPropertyOptional({ description: 'Primary phone' })
  @IsString()
  @IsOptional()
  primaryPhone?: string;
}
