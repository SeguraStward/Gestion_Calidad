import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { AuditFields } from '@src/dtos/audit-fields.dto';
import { Status } from '@una-gc/database/prisma/generated/client';

import { Expose } from 'class-transformer';

export class UserPermissionDto extends AuditFields {
  @ApiPropertyOptional({ description: 'UserPermission ID' })
  @IsString()
  @IsOptional()
  @Expose()
  id?: string;

  @ApiPropertyOptional({ description: 'Permission name' })
  @IsString()
  @Expose()
  name: string;

  // NOTE: THE code only can be modified by the system administrator (is for code references)
  // @ApiPropertyOptional({ description: 'Permission code identifier' })
  // @IsString()
  // code: string;

  @ApiPropertyOptional({ description: 'Parent permission ID' })
  @IsString()
  @IsOptional()
  @Expose()
  parentId?: string;

  @ApiPropertyOptional({ description: 'Permission status', enum: Status })
  @IsEnum(Status)
  @IsOptional()
  @Expose()
  status?: Status;

  @Expose()
  code?: string;


  constructor(dto: Partial<UserPermissionDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
