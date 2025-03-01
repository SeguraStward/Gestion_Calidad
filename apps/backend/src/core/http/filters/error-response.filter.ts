import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class ErrorResponseFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const { status, message, details, code } = this.extractExceptionDetails(exception);

    response.status(status).json({
      errors: {
        code,
        title: message,
        ...(details && { details }),
      },
    });
  }

  private extractExceptionDetails(exception: unknown) {
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: Record<string, string[]> | undefined;
    let code = this.getErrorCode(status);

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      code = this.getErrorCode(status);

      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const exceptionObj = exceptionResponse as Record<string, unknown>;
        message = this.extractMessage(exceptionObj, exception.message);
        details = exceptionObj['details'] as Record<string, string[]> | undefined;
      } else {
        message = exceptionResponse as string;
      }
    }
    return { status, message, details, code };
  }

  private extractMessage(response: Record<string, unknown>, fallback: string): string {
    const message = response['message'] || fallback;
    if (Array.isArray(message)) {
      return message[0];
    }
    return message as string;
  }

  private getErrorCode(status: number): string {
    const errorCodeMap: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'validation_error',
      [HttpStatus.UNAUTHORIZED]: 'unauthorized',
      [HttpStatus.FORBIDDEN]: 'forbidden',
      [HttpStatus.NOT_FOUND]: 'not_found',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'server_error',
    };
    return errorCodeMap[status] || 'unknown_error';
  }

  private logError(exception: unknown, context: { status: number; message: string; code: string }) {
    console.error(`Error occurred:`, { exception, context });
  }
}
