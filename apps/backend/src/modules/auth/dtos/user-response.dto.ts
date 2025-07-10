import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'Unique user ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'juan.perez@est.una.ac.cr',
  })
  email: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'Juan Carlos',
    required: false,
  })
  fullName?: string;

  @ApiProperty({
    description: 'User last names',
    example: 'Pérez González',
    required: false,
  })
  fullLastName?: string;

  @ApiProperty({
    description: 'Profile photo URL',
    example: 'https://lh3.googleusercontent.com/...',
    required: false,
  })
  photoUrl?: string | null;

  @ApiProperty({
    description: 'User status',
    example: 'ACTIVE',
    enum: ['PRE_REGISTRATION', 'ACTIVE', 'INACTIVE'],
  })
  status: string;
}
