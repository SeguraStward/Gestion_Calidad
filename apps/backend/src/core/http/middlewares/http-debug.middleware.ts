import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HttpDebugMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, cookies, headers } = req;

    this.logger.debug(`[REQUEST] ${method} ${originalUrl}`);

    // Log authorization headers safely (redacted)
    if (headers.authorization) {
      this.logger.debug('Authorization header present');
    }

    // Log cookies (but redact sensitive ones)
    if (cookies && Object.keys(cookies).length > 0) {
      const redactedCookies = { ...cookies };
      if (redactedCookies.auth_token) redactedCookies.auth_token = '[REDACTED]';
      if (redactedCookies.refresh_token) redactedCookies.refresh_token = '[REDACTED]';
      this.logger.debug(`Cookies: ${JSON.stringify(redactedCookies)}`);
    }

    // Capture response data
    const originalSend = res.send;
    res.send = function (body) {
      // const responseBody = body instanceof Buffer ? '[Buffer]' : typeof body === 'object' ? '[Object]' : body;

      const responseData = {
        method,
        originalUrl,
        statusCode: res.statusCode,
        contentLength: `${body?.length || 0}b`,
        // responseTimeMs: Date.now() - (req.startTime || Date.now()),
        timestamp: new Date().toISOString(),
      };

      Logger.debug(`[HTTP] Request Details:`, 'HTTP');
      Logger.debug(`[HTTP] Object:`, 'HTTP');
      Logger.debug(JSON.stringify(responseData, null, 2), 'HTTP');

      return originalSend.call(this, body);
    };

    // Set start time for calculating response time
    // req.startTime = Date.now();

    next();
  }
}
