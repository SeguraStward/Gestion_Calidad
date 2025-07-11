import { PermissionsGuard } from '@modules/auth';
import { RequirePermissions, RESOURCE_NAME_TOKEN } from '@modules/auth/decorators';
import { UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PermissionType } from '@una-gc/database/prisma/generated/client';

export const AuthorizedEndpoint =
  (action: PermissionType) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    ApiBearerAuth()(target, propertyKey, descriptor);
    UseGuards(PermissionsGuard)(target, propertyKey, descriptor);
    RequirePermissions({ resource: RESOURCE_NAME_TOKEN, action })(target, propertyKey, descriptor);
  };
