import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';

import { Status } from '@una-gc/database/prisma/generated/client';
import { BaseDto } from '@src/modules/generalDto';

export class UserPermissionDto extends BaseDto {
  @ApiPropertyOptional({ description: 'UserPermission ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ description: 'Permission name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Permission code identifier' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: 'Parent permission ID' })
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({ description: 'Permission status', enum: Status })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  constructor(dto: Partial<UserPermissionDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
