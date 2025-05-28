import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt } from 'class-validator';

import { BaseDto } from '@src/modules/generalDto';

export class ClassroomDto extends BaseDto {
  @ApiPropertyOptional({ description: 'Classroom ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Room Number' })
  @IsString()
  roomNumber: string;

  @ApiProperty({ description: 'Classroom Capacity' })
  @IsInt()
  capacity: number;

  @ApiProperty({ description: 'Classroom Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Campus ID' })
  @IsString()
  campusId: string;

  constructor(dto: Partial<ClassroomDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
