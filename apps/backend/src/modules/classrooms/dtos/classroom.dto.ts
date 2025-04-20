import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt } from 'class-validator';

export class ClassroomDto {
  @ApiPropertyOptional({ description: 'Classroom ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ description: 'Version', readOnly: true })
  @IsInt()
  @IsOptional()
  version?: number;

  @ApiProperty({ description: 'Room Number' })
  @IsString()
  roomNumber: string;

  @ApiProperty({ description: 'Classroom Capacity' })
  @IsInt()
  capacity: number;

  @ApiProperty({ description: 'Campus ID' })
  @IsString()
  campusId: string;

  constructor(dto: Partial<ClassroomDto> = {}) {
    Object.assign(this, dto);
  }
}
