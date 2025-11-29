import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

export interface RequestWithContext extends Request {
  ipAddress?: string;
  userAgent?: string;
  userId?: string;
}

/**
 * Interceptor para capturar información del request (IP, User Agent, User ID)
 * y hacerla disponible para el logging de historial
 */
@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<RequestWithContext>();

    // Capturar IP address
    const ipAddress =
      request.headers['x-forwarded-for'] ||
      request.headers['x-real-ip'] ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress;

    // Capturar User Agent
    const userAgent = request.headers['user-agent'] || 'Unknown';

    // Capturar User ID del token JWT (si está disponible)
    const user = (request as any).user;
    const userId = user?.userId || user?.id || user?.sub;

    // Agregar al request para uso posterior
    request.ipAddress = Array.isArray(ipAddress) ? ipAddress[0] : ipAddress;
    request.userAgent = userAgent;
    request.userId = userId;

    return next.handle();
  }
}
