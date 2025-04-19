import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class EvidenceDto {
  @ApiProperty({ description: 'File ID' })
  @IsString()
  fileId: string;

  @ApiProperty({ description: 'File name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'File type' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'URI path' })
  @IsString()
  uri: string;

  @ApiProperty({ description: 'Link to evidence' })
  @IsString()
  link: string;

  @ApiProperty({ description: 'Download path' })
  @IsString()
  download: string;
}
