import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class AuditFieldsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = (request.user as any)?.sub || (request.user as any)?.id || 'system';
    const now = new Date();

    if (request.method === 'POST' && request.body) {
      request.body.createdAt = now;
      request.body.updatedAt = now;
      request.body.createdBy = userId;
      request.body.updatedBy = userId;
    }

    if ((request.method === 'PUT' || request.method === 'PATCH') && request.body) {
      request.body.updatedAt = now;
      request.body.updatedBy = userId;
    }

    return next.handle();
  }
}
