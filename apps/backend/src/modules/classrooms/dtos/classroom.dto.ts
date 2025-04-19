import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsEnum } from 'class-validator'; // delete if not needed someones
// import { } from '@una-gc/database/prisma/generated/client'; // form imports for Prisma types

export class ClassroomDto {
  @ApiPropertyOptional({ description: 'Classroom ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Name' })
  @IsString()
  name: string;

  constructor(dto: Partial<ClassroomDto> = {}) {
    Object.assign(this, dto);
  }
}
