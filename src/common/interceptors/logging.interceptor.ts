import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Observable, tap } from 'rxjs';

/**
 * Interceptor que loga o método, URL, status code e duração de cada request.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const { method, url } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse<FastifyReply>();
        const statusCode = response.statusCode;
        const duration = Date.now() - now;

        this.logger.log(`${method} ${url} ${statusCode} - ${duration}ms`);
      }),
    );
  }
}
