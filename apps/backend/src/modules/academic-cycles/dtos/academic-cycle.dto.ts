import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, IsDate, IsNotEmpty } from 'class-validator';
import { Expose, Type } from 'class-transformer'; // Import Expose
import { Status } from '@una-gc/database/prisma/generated/client';
import { BaseDto } from '@src/modules/generalDto';

export class AcademicCycleDto extends BaseDto {
  @ApiPropertyOptional({ description: 'AcademicCycle ID' })
  @Expose() // Add Expose
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Name of the academic cycle' })
  @Expose() // Add Expose
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Year of the academic cycle' }) // Changed to non-optional to match Prisma
  @Expose() // Add Expose
  @IsInt()
  // @IsOptional() // Removed IsOptional as 'year' is non-optional in Prisma schema
  year: number;

  @ApiPropertyOptional({ description: 'Description of the academic cycle' }) // Prisma schema has description as String? (optional)
  @Expose() // Add Expose
  @IsString()
  @IsOptional() // Keep IsOptional, remove IsNotEmpty if it can be truly empty or null
  // @IsNotEmpty() // Removed IsNotEmpty as description is optional in Prisma
  description?: string;

  @ApiPropertyOptional({ description: 'Start date of the academic cycle' })
  @Expose() // Add Expose
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({ description: 'End date of the academic cycle' })
  @Expose() // Add Expose
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @ApiProperty({ description: 'Status of the academic cycle' })
  @Expose() // Add Expose
  @IsEnum(Status)
  status: Status;

  constructor(dto: Partial<AcademicCycleDto> | any = {}) {
    // Accept Prisma entity via any
    super();
    Object.assign(this, dto);
  }
}
