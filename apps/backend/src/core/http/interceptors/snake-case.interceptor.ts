import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';

@Injectable()
export class SnakeCaseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (Array.isArray(data)) {
          return data.map((item) => this.toSnakeCase(item));
        }

        return this.toSnakeCase(data);
      }),
    );
  }

  private toSnakeCase(data: any): any {
    if (data && typeof data === 'object' && !(data instanceof Date)) {
      if (Array.isArray(data)) {
        return data.map((item) => this.toSnakeCase(item));
      } else {
        return _.mapValues(
          _.mapKeys(data, (value, key) => _.snakeCase(key)),
          (value) => this.toSnakeCase(value),
        );
      }
    }
    return data;
  }
}
