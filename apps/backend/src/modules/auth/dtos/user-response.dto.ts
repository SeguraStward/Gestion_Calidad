import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'ID único del usuario',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre para mostrar (derivado de fullName o email)',
    example: 'Juan Carlos',
  })
  name: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan.perez@est.una.ac.cr',
  })
  email: string;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Carlos',
    required: false,
  })
  fullName?: string;

  @ApiProperty({
    description: 'Apellidos del usuario',
    example: 'Pérez González',
    required: false,
  })
  fullLastName?: string;

  @ApiProperty({
    description: 'URL de la foto de perfil',
    example: 'https://lh3.googleusercontent.com/...',
    required: false,
  })
  photoUrl?: string | null;

  @ApiProperty({
    description: 'Estado del usuario',
    example: 'ACTIVE',
    enum: ['PRE_REGISTRATION', 'ACTIVE', 'INACTIVE'],
  })
  status: string;
}
