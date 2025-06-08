import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { Status } from '@una-gc/database/prisma/generated/client';
import { BaseDto } from '@src/modules/generalDto';
import { CampusDto } from '@src/modules/campuses/dtos/campus.dto';
import { CommissionDto } from '@src/modules/commissions/dtos/commission.dto';
import { ProjectDto } from '@src/modules/projects/dtos/project.dto';

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

  @ApiPropertyOptional({ type: () => [CommissionDto] })
  @Expose()
  @Type(() => CommissionDto)
  @IsOptional()
  commissions?: CommissionDto[];

  @ApiPropertyOptional({ type: () => [ProjectDto] })
  @Expose()
  @Type(() => ProjectDto)
  @IsOptional()
  projects?: ProjectDto[];

  constructor(partial: Partial<RegionalCenterDto> | any = {}) {
    super();
    Object.assign(this, partial);
    if (partial.campuses && Array.isArray(partial.campuses)) {
      this.campuses = partial.campuses.map((c: any) => (c instanceof CampusDto ? c : new CampusDto(c)));
    }
  }
}
