import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsEmail, IsOptional, IsString } from 'class-validator';
import { IsUniversityEmail } from '@modules/users/validators/is-university-email.validator';

export class UpdateUserDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  @IsUniversityEmail()
  email: string;

  @ApiPropertyOptional({ description: 'First name' })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({ description: 'Last name' })
  @IsString()
  @IsOptional()
  fullLastName?: string;

  @ApiPropertyOptional({ description: 'Primary phone' })
  @IsString()
  @IsOptional()
  primaryPhone?: string;
}
