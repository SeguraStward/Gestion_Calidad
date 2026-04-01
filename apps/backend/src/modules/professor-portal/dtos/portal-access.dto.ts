import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PortalAccessDto {
  @ApiProperty({ description: 'Cédula del profesor', example: '112340567' })
  @IsString()
  cedula!: string;

  @ApiProperty({ description: 'Token de acceso generado por Erick', example: 'uuid-v4-token' })
  @IsString()
  token!: string;
}
