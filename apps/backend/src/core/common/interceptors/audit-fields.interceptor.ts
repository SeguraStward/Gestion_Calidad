import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class AuditFieldsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditFieldsInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    try {
      const request = context.switchToHttp().getRequest<Request>();

      if (!request) {
        this.logger.error('Failed to get request object from context');
        throw new InternalServerErrorException('Failed to process request');
      }

      const userId = this.extractUserId(request);
      const now = new Date();

      this.logger.debug(`Processing ${request.method} request for user ${userId}`);

      if (request.method === 'POST') {
        this.addCreateFields(request, userId, now);
      }

      if (request.method === 'PUT' || request.method === 'PATCH') {
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
      throw new InternalServerErrorException('Failed to process audit fields');
    }
  }

  private extractUserId(request: Request): string {
    try {
      if (!request.user) {
        this.logger.warn('No user found in request');
        return 'system';
      }

      const userId = (request.user as any)?.sub || (request.user as any)?.id || 'system';
      this.logger.debug(`Extracted user ID: ${userId}`);
      return userId;
    } catch (error: any) {
      this.logger.error(`Failed to extract user ID: ${error.message}`, error.stack);
      return 'system';
    }
  }

  private addCreateFields(request: Request, userId: string, timestamp: Date): void {
    try {
      if (!request.body) {
        this.logger.warn('No request body found for POST request');
        return;
      }

      this.logger.debug('Adding creation audit fields');
      request.body.createdAt = timestamp;
      request.body.updatedAt = timestamp;
      request.body.createdBy = userId;
      request.body.updatedBy = userId;
    } catch (error: any) {
      this.logger.error(`Error adding create fields: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to add creation audit fields');
    }
  }

  private addUpdateFields(request: Request, userId: string, timestamp: Date): void {
    try {
      if (!request.body) {
        this.logger.warn(`No request body found for ${request.method} request`);
        return;
      }

      this.logger.debug('Adding update audit fields');
      request.body.updatedAt = timestamp;
      request.body.updatedBy = userId;
    } catch (error: any) {
      this.logger.error(`Error adding update fields: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to add update audit fields');
    }
  }
}
