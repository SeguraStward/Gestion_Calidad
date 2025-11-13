import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class ValidateAvailabilityDto {
  @ApiProperty({ description: 'Tiempo solicitado a validar', example: 8 })
  @IsNumber()
  @IsPositive()
  requestedTime!: number;
}
