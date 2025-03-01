import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class HttpResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();

    return next.handle().pipe(
      map((data) => {
        // Uniform error response handled separately; this focuses on success cases.
        const isGetRequest = request.method === 'GET';
        const isDeleteRequest = request.method === 'DELETE';

        if (isDeleteRequest) {
          return { meta: { message: 'Success' } };
        }

        const pagination = isGetRequest && data?.meta ? data.meta : null;

        return {
          data: data?.data || data || {},
          meta: pagination
            ? {
                limit: pagination.limit || 10,
                page: pagination.page || 1,
                total: pagination.total || 0,
              }
            : undefined,
        };
      }),
    );
  }
}
