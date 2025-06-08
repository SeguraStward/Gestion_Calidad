import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { Status } from '@una-gc/database/prisma/generated/client';
import { BaseDto } from '@src/modules/generalDto';
import { CampusDto } from '@src/modules/campuses/dtos/campus.dto';

export class RegionalCenterDto extends BaseDto {
  @ApiPropertyOptional({ description: 'RegionalCenter ID' })
  @Expose()
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Code' })
  @Expose()
  @IsString()
  code: string;

  @ApiProperty({ description: 'Name' })
  @Expose()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Status', enum: Status })
  @Expose()
  @IsEnum(Status)
  status: Status;

  @ApiPropertyOptional({ type: () => [CampusDto] })
  @Expose()
  @Type(() => CampusDto)
  @IsOptional()
  campuses?: CampusDto[];

  constructor(partial: Partial<RegionalCenterDto> | any = {}) {
    super();
    Object.assign(this, partial);
    if (partial.campuses && Array.isArray(partial.campuses)) {
      this.campuses = partial.campuses.map((c: any) => (c instanceof CampusDto ? c : new CampusDto(c)));
    }
  }
}
