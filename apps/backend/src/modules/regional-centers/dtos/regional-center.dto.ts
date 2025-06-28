import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuditFields } from '@src/dtos/audit-fields.dto';
import { CampusDto } from '@src/modules/campuses/dtos/campus.dto';
import { CommissionDto } from '@src/modules/commissions/dtos/commission.dto';
import { ProjectDto } from '@src/modules/projects/dtos/project.dto';
import { Status } from '@una-gc/database/prisma/generated/client';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class RegionalCenterDto extends AuditFields {
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
