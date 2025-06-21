import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({
    description: 'Email del usuario (debe ser dominio autorizado)',
    example: 'juan.perez@est.una.ac.cr',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Carlos',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    description: 'Apellidos del usuario',
    example: 'Pérez González',
  })
  @IsString()
  @IsNotEmpty()
  fullLastName: string;

  @ApiProperty({
    description: 'ID de Google del usuario',
    example: '1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  googleId?: string;

  @ApiProperty({
    description: 'URL de la foto de perfil',
    example: 'https://lh3.googleusercontent.com/...',
    required: false,
  })
  @IsString()
  @IsOptional()
  photoUrl?: string;
}
