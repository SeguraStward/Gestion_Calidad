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
      // let responseBodyToLog;
      // if (body instanceof Buffer) {
      //   responseBodyToLog = '[Buffer]';
      // } else if (typeof body === 'string') {
      //   try {
      //     const parsedBody = JSON.parse(body);
      //     responseBodyToLog = JSON.stringify(parsedBody, null, 2);
      //   } catch {
      //     responseBodyToLog = body.length > 500 ? `${body.substring(0, 500)}...` : body;
      //   }
      // } else if (typeof body === 'object') {
      //   responseBodyToLog = JSON.stringify(body, null, 2);
      // } else {
      //   responseBodyToLog = String(body);
      // }

      // const responseData = {
      //   method,
      //   originalUrl,
      //   statusCode: res.statusCode,
      //   contentLength: `${body?.length || 0}b`,
      //   timestamp: new Date().toISOString(),
      // };

      // Logger.debug(`[HTTP] Response Details:`, 'HTTP');
      // Logger.debug(JSON.stringify(responseData, null, 2), 'HTTP');
      // Logger.debug(`[HTTP] Response Body:`, 'HTTP');
      // Logger.debug(responseBodyToLog, 'HTTP');

      return originalSend.call(this, body);
    };

    next();
  }
}
