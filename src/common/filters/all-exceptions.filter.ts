import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FastifyReply, FastifyRequest } from 'fastify';

/**
 * Filtro global que captura QUALQUER exceção não tratada.
 * Garante que toda exceção retorne um JSON padronizado.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  private readonly isInProductionMode: boolean;
  private readonly internalServerErrorMessage: string;

  constructor(private readonly configService: ConfigService) {
    this.isInProductionMode =
      configService.get<'development' | 'production'>('app.nodeEnv') !==
      'development';
    this.internalServerErrorMessage =
      'Ocorreu um erro, tente novamente mais tarde.';
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    if (exception instanceof HttpException) {
      this.catchHttpException(exception, request, response);

      return;
    }

    const stacktrace =
      exception instanceof Error ? exception.stack : String(exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      message: this.internalServerErrorMessage,
      path: !this.isInProductionMode ? request.url : undefined,
      stacktrace: !this.isInProductionMode ? stacktrace : undefined,
    });
  }

  private catchHttpException(
    exception: HttpException,
    request: FastifyRequest,
    response: FastifyReply,
  ) {
    const statusCode = exception.getStatus();
    const message =
      statusCode >= 500 ? this.internalServerErrorMessage : exception.message;

    if (this.isInProductionMode) {
      response.status(statusCode).send({ message });
      return;
    }

    if (statusCode >= 400 && statusCode < 500) {
      const responseBody = exception.getResponse();
      const errors =
        typeof responseBody === 'object' && responseBody !== null
          ? (responseBody as { errors?: unknown }).errors
          : undefined;

      response.status(statusCode).send({
        message,
        errors,
        path: request.url,
        stacktrace: exception.stack,
      });

      return;
    }

    response.status(statusCode).send({
      message,
      path: request.url,
      stacktrace: exception.stack,
    });
  }
}
