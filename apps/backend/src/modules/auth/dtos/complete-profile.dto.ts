import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CompleteProfileDto {
  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Carlos',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  fullName: string;

  @ApiProperty({
    description: 'Apellidos del usuario',
    example: 'Pérez González',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Los apellidos deben tener al menos 2 caracteres' })
  fullLastName: string;

  @ApiProperty({
    description: 'Número de teléfono (opcional)',
    example: '+506 8888-8888',
    required: false,
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string;
}
