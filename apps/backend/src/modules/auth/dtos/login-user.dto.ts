import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'juan.perez@est.una.ac.cr',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'ID de Google del usuario',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty()
  googleId: string;
}
