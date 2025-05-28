import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

import { PermissionScope, PermissionType, Status } from '@una-gc/database/prisma/generated/client';
import { BaseDto } from '@src/modules/generalDto';

export class PermissionDto {
  @ApiProperty({ description: 'Permission ID' })
  @IsString()
  @IsNotEmpty()
  permissionID: string;

  @ApiProperty({ enum: PermissionType, isArray: true })
  @IsEnum(PermissionType, { each: true })
  @IsArray()
  permissions: PermissionType[];

  @ApiPropertyOptional({ enum: PermissionScope })
  @IsEnum(PermissionScope)
  @IsOptional()
  scope?: PermissionScope;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  actions?: string[];
}

export class UserRoleDto extends BaseDto {
  @ApiPropertyOptional({ description: 'UserRole ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Role name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Role description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: [PermissionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  permissions: PermissionDto[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  userIds?: string[];

  @ApiPropertyOptional({ enum: Status, default: Status.ACTIVE })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  constructor(dto: Partial<UserRoleDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}
