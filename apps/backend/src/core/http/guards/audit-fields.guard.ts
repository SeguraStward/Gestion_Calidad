import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { AuditFieldsUtil, AuditableRequest } from '@core/common/utils/audit-fields.util';
import { Reflector } from '@nestjs/core';

/**
 * Guard to automatically add audit fields to requests.
 * This guard processes the request to add createdBy, updatedBy, createdAt, and updatedAt fields
 * based on the authenticated user and the current timestamp.
 * It skips processing if the endpoint is marked with @SkipAudit decorator.
 *
 * Usage:
 * - Apply this guard globally or to specific controllers/routes.
 * - Ensure that the request object contains a user with an ID or sub field.
 * - The guard will log debug information about the audit fields being added.
 * - If an error occurs, it will log the error and continue processing the request.
 */
@Injectable()
export class AuditFieldsGuard implements CanActivate {
  private readonly logger = new Logger(AuditFieldsGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const request = context.switchToHttp().getRequest<AuditableRequest>();

      if (!request) {
        this.logger.warn('No request object found in context');
        return true;
      }

      const skipAudit = this.reflector.get<boolean>('skipAudit', context.getHandler());
      if (skipAudit) {
        this.logger.debug('Skipping audit as endpoint is marked with skipAudit');
        return true;
      }

      this.logger.debug(`Applying audit fields via guard for ${request.method} request`);
      AuditFieldsUtil.processAuditFields(request);

      return true;
    } catch (error: any) {
      this.logger.error(`Error in AuditFieldsGuard: ${error.message}`, error.stack);

      return true;
    }
  }
}
