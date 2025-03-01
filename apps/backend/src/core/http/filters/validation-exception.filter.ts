import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { ErrorResponse } from '../interfaces/error-response.interface';

@Catch(HttpException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse() as any;
    const validationErrors = exceptionResponse.message || [];

    const formattedErrors = validationErrors.reduce((acc: any, error: any) => {
      acc[error.property] = Object.values(error.constraints);
      return acc;
    }, {});

    const errorResponse: ErrorResponse = {
      errors: {
        code: 'validation_error',
        title: 'Validation Error',
        details: formattedErrors,
      },
    };

    response.status(status).json(errorResponse);
  }
}
