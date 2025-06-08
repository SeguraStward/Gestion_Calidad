import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Request } from 'express';

interface AuditableRequest extends Request {
  body: Record<string, any>;
  user?: {
    sub?: string;
    id?: string;
    [key: string]: any;
  };
}

@Injectable()
export class AuditFieldsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditFieldsInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    try {
      const request = context.switchToHttp().getRequest<AuditableRequest>();

      if (!request || !request.method) {
        this.logger.warn('Invalid request object from context');
        return next.handle();
      }

      // Skip audit if there's no body
      if (!request.body || typeof request.body !== 'object') {
        return next.handle();
      }

      const userId = this.extractUserId(request);
      const now = new Date();

      this.logger.debug(`Processing ${request.method} request for user ${userId}`);

      if (request.method === 'POST') {
        this.addCreateFields(request, userId, now);
      }

      if (['PUT', 'PATCH'].includes(request.method)) {
        this.addUpdateFields(request, userId, now);
      }

      return next.handle().pipe(
        tap(() => {
          this.logger.debug('Request processed successfully');
        }),
        catchError((error) => {
          this.logger.error(`Error in request processing: ${error.message}`, error.stack);
          return throwError(() => error);
        }),
      );
    } catch (error: any) {
      this.logger.error(`Error in interceptor: ${error.message}`, error.stack);
      return next.handle(); // Continue with the request even if audit fails
    }
  }

  private extractUserId(request: AuditableRequest): string {
    try {
      if (!request.user) {
        return 'system';
      }

      // First try to get the standard JWT 'sub' claim
      if (request.user.sub) {
        return request.user.sub;
      }

      // Fall back to 'id' if present
      if (request.user.id) {
        return request.user.id;
      }

      return 'system';
    } catch (error: any) {
      this.logger.warn(`Failed to extract user ID: ${error.message}`);
      return 'system';
    }
  }

  private addCreateFields(request: AuditableRequest, userId: string, timestamp: Date): void {
    try {
      request.body.createdAt = timestamp;
      request.body.updatedAt = timestamp;
      request.body.createdBy = userId;
      request.body.updatedBy = userId;
    } catch (error: any) {
      this.logger.warn(`Error adding create fields: ${error.message}`);
      // Don't throw here to allow the request to continue
    }
  }

  private addUpdateFields(request: AuditableRequest, userId: string, timestamp: Date): void {
    try {
      request.body.updatedAt = timestamp;
      request.body.updatedBy = userId;
    } catch (error: any) {
      this.logger.warn(`Error adding update fields: ${error.message}`);
      // Don't throw here to allow the request to continue
    }
  }
}
