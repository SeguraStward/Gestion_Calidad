import { Logger } from '@nestjs/common';

export interface AuditableUser {
  id?: string;
  sub?: string;
  [key: string]: any;
}

export interface AuditableRequest {
  body: Record<string, any>;
  user?: AuditableUser;
  method?: string;
}
/*
 * Utility class for handling audit fields in requests.
 * Provides methods to extract user ID, add audit fields, and process requests.
 */
export class AuditFieldsUtil {
  private static readonly logger = new Logger(AuditFieldsUtil.name);

  static extractUserId(user?: AuditableUser): string {
    if (!user) {
      this.logger.debug('No user found in request, using system');
      return '111111111111111111111111'; // undefined user ID, return a default value
    }

    try {
      if (user.sub && typeof user.sub === 'string') {
        this.logger.debug(`User ID extracted from 'sub': ${user.sub}`);
        return user.sub;
      }

      if (user.id && typeof user.id === 'string') {
        this.logger.debug(`User ID extracted from 'id': ${user.id}`);
        return user.id;
      }

      if (user.userId && typeof user.userId === 'string') {
        this.logger.debug(`User ID extracted from 'userId': ${user.userId}`);
        return user.userId;
      }

      this.logger.warn('No valid user ID found in user object, using system');
      return 'system';
    } catch (error: any) {
      this.logger.error(`Error extracting user ID: ${error.message}`);
      return 'system';
    }
  }

  static addCreateFields(body: Record<string, any>, userId: string, timestamp: Date = new Date()): void {
    try {
      body.createdAt = timestamp;
      body.updatedAt = timestamp;
      body.createdBy = userId;
      body.updatedBy = userId;

      this.logger.debug(`Added create audit fields for user: ${userId}`);
    } catch (error: any) {
      this.logger.error(`Error adding create fields: ${error.message}`);
      // Do not throw error to allow the request to continue
    }
  }

  static addUpdateFields(body: Record<string, any>, userId: string, timestamp: Date = new Date()): void {
    try {
      body.updatedAt = timestamp;
      body.updatedBy = userId;

      this.logger.debug(`Added update audit fields for user: ${userId}`);
    } catch (error: any) {
      this.logger.error(`Error adding update fields: ${error.message}`);
      // Do not throw error to allow the request to continue
    }
  }

  static shouldAudit(request: AuditableRequest): boolean {
    if (!request || !request.method) {
      return false;
    }

    const auditableMethods = ['POST', 'PUT', 'PATCH'];
    return auditableMethods.includes(request.method);
  }

  static hasValidBody(body: any): boolean {
    return body && typeof body === 'object' && !Array.isArray(body);
  }

  static processAuditFields(request: AuditableRequest): void {
    if (!this.shouldAudit(request)) {
      this.logger.debug(`Method ${request.method} does not require audit`);
      return;
    }

    if (!this.hasValidBody(request.body)) {
      this.logger.debug('Invalid or missing body, skipping audit');
      return;
    }

    const userId = this.extractUserId(request.user);
    const timestamp = new Date();

    switch (request.method) {
      case 'POST':
        this.addCreateFields(request.body, userId, timestamp);
        break;
      case 'PUT':
      case 'PATCH':
        this.addUpdateFields(request.body, userId, timestamp);
        break;
      default:
        this.logger.debug(`Method ${request.method} not handled by audit`);
    }
  }
}
