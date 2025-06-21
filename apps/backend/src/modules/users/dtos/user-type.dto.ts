import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumberString } from 'class-validator';

import { Expose } from 'class-transformer';

export class UserPhoneDto {
  @ApiProperty({ description: 'Phone number' })
  @IsString()
  @IsNumberString()
  @Expose()
  number: string;

  @ApiProperty({ description: 'Phone type' })
  @IsString()
  @Expose()
  type: string;
}
