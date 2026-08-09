import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common';
import {
  Observable,
  throwError,
  timeout,
  catchError,
  TimeoutError,
} from 'rxjs';

/**
 * Interceptor que define um timeout global para requests.
 * Lança RequestTimeoutException se o tempo for excedido.
 */
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private readonly timeoutMs = 30_000;

  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(this.timeoutMs),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(
            () => new RequestTimeoutException('Request timeout'),
          );
        }
        return throwError(() => new InternalServerErrorException());
      }),
    );
  }
}
