import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDocumentCounterDto {
  @ApiProperty({ description: 'Proof Document Type ID' })
  @IsString()
  @IsNotEmpty()
  proofDocumentTypeId: string;

  @ApiPropertyOptional({ description: 'Last number used', default: 0 })
  @IsNumber()
  @IsOptional()
  lastNumber?: number;
}
