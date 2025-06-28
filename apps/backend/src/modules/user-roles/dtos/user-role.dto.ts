import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

import { AuditFields } from '@src/dtos/audit-fields.dto';
import { PermissionScope, PermissionType, Status } from '@una-gc/database/prisma/generated/client';

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

export class UserRoleDto extends AuditFields {
  @ApiPropertyOptional({ description: 'UserRole ID' })
  @IsString()
  @IsOptional()
  @Expose()
  id?: string;

  @ApiProperty({ description: 'Role name' })
  @IsString()
  @IsNotEmpty()
  @Expose()
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
