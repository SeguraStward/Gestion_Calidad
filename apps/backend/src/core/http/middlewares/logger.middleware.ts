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

    this.logRequestStart(method, originalUrl);

    // Interceptar res.send para loguear el contenido de la respuesta
    const originalSend = res.send;
    res.send = (body?: any): Response => {
      let responseBodyToLog;
      if (body instanceof Buffer) {
        responseBodyToLog = '[Buffer]';
      } else if (typeof body === 'string') {
        try {
          const parsedBody = JSON.parse(body);
          responseBodyToLog = JSON.stringify(parsedBody, null, 2);
        } catch {
          responseBodyToLog = body;
        }
      } else if (typeof body === 'object') {
        responseBodyToLog = JSON.stringify(body, null, 2);
      } else {
        responseBodyToLog = String(body);
      }
      if (responseBodyToLog && responseBodyToLog !== '{}') {
        this.logger.debug(`[HTTP] Response Body: ${responseBodyToLog}`);
      }
      return originalSend.call(res, body);
    };

    res.on('finish', () => {
      this.logRequestFinish(req, res, startTime);
    });

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

    this.logger.log(
      `${this.getStatusEmoji(statusCode)} ${method} ${originalUrl} - Status: ${statusCode} - Size: ${contentLength}b - Time: ${responseTime}ms`,
    );

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

    this.logger.debug(
      `Request: ${logData.method} ${logData.originalUrl} - Status: ${logData.statusCode} - Size: ${logData.contentLength} - Time: ${logData.responseTimeMs}ms - At: ${logData.timestamp}`,
    );
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
