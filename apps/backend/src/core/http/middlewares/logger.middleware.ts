import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RequestLogData {
  method: string;
  originalUrl: string;
  statusCode: number;
  // ip: string;
  // userAgent: string;
  contentLength: string;
  responseTimeMs: number;
  timestamp: string;
}

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');
  private readonly MAX_USER_AGENT_LENGTH = 70;

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const { method, originalUrl } = req;

    // Log de inicio de solicitud
    this.logRequestStart(method, originalUrl);

    // Configurar listener para el final de la respuesta
    res.on('finish', () => {
      this.logRequestFinish(req, res, startTime);
    });

    // Manejar errores de respuesta
    res.on('error', (error) => {
      this.logger.error(`Request error for ${method} ${originalUrl}:`, error.message);
    });

    next();
  }

  private logRequestStart(method: string, originalUrl): void {
    this.logger.log(`⮕ ${method} ${originalUrl} `);
  }

  private logRequestFinish(req: Request, res: Response, startTime: number): void {
    const { method, originalUrl } = req;
    const { statusCode } = res;
    const contentLength = res.get('content-length') || '0';
    const responseTime = Date.now() - startTime;

    // Log principal con información básica
    this.logger.log(
      `${this.getStatusEmoji(statusCode)} ${method} ${originalUrl} - Status: ${statusCode} - Size: ${contentLength}b - Time: ${responseTime}ms`,
    );

    // Log detallado para debug
    this.logDebugDetails(req, res, responseTime);
  }

  private logDebugDetails(req: Request, res: Response, responseTime: number): void {
    const logData: RequestLogData = {
      method: req.method,
      originalUrl: req.originalUrl,
      statusCode: res.statusCode,
      // ip: this.getClientIp(req),
      // userAgent: req.get('user-agent') || 'Unknown',
      contentLength: `${res.get('content-length') || 0}b`,
      responseTimeMs: responseTime,
      timestamp: new Date().toISOString(),
    };

    this.logger.debug('Request Details:', logData);
  }

  private getClientIp(req: Request): string {
    return (
      req.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.get('x-real-ip') ||
      req.socket?.remoteAddress ||
      req.ip ||
      'Unknown'
    );
  }

  private truncateUserAgent(userAgent: string): string {
    if (userAgent.length <= this.MAX_USER_AGENT_LENGTH) {
      return userAgent;
    }
    return `${userAgent.substring(0, this.MAX_USER_AGENT_LENGTH - 3)}...`;
  }

  private getStatusEmoji(statusCode: number): string {
    if (statusCode >= 200 && statusCode < 300) return '✅';
    if (statusCode >= 300 && statusCode < 400) return '↩️';
    if (statusCode >= 400 && statusCode < 500) return '⚠️';
    if (statusCode >= 500) return '❌';
    return '✓';
  }
}

/*
Funcionalidad principal
Intercepta cada solicitud HTTP: Se ejecuta antes de que las solicitudes lleguen a los controladores.

Captura datos iniciales de la solicitud:

El método HTTP (GET, POST, etc.)
La URL solicitada
El user-agent del cliente
La dirección IP del cliente
La hora de inicio de la solicitud
Registra métricas de rendimiento:

Se suscribe al evento 'finish' de la respuesta
Cuando la respuesta termina, calcula:
El código de estado HTTP (200, 404, etc.)
El tamaño de la respuesta en bytes
El tiempo de respuesta en milisegundos
Genera un log completo: Combina toda esta información en un único mensaje de registro
*/
