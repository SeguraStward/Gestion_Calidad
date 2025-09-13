import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateStandardEvidenceDto {
  @ApiProperty({ description: 'Standard ID' })
  @IsString()
  @IsNotEmpty()
  standardId: string;

  @ApiProperty({ description: 'Evidence ID' })
  @IsString()
  @IsNotEmpty()
  evidenceId: string;
}
