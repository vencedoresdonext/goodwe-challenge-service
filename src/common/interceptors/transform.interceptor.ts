import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpResponse } from '../types';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  HttpResponse<T>
> {
  intercept(
    _: ExecutionContext,
    next: CallHandler,
  ): Observable<HttpResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        if (
          data &&
          typeof data === 'object' &&
          'data' in data &&
          'message' in data
        ) {
          return data as HttpResponse<T>;
        }

        if (data === undefined || data === null) {
          return {};
        }

        return {
          message: 'Success',
          data: data as T,
        };
      }),
    );
  }
}
