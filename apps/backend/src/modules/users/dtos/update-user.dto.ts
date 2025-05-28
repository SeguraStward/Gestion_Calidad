import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

import { IsUniversityEmail } from '@modules/users/validators/is-university-email.validator';
import { BaseDto } from '@src/modules/generalDto';

export class UpdateUserDto extends BaseDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  @IsUniversityEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Full name' })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({ description: 'Full last name' })
  @IsString()
  @IsOptional()
  fullLastName?: string;

  @ApiPropertyOptional({ description: 'Primary phone' })
  @IsString()
  @IsOptional()
  primaryPhone?: string;
}
