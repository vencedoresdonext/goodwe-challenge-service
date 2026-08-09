import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CORRELATION_ID_HEADER } from '../constants';
import { FastifyReply, FastifyRequest } from 'fastify';

/**
 * Middleware que injeta um Correlation ID em cada request.
 * Se o header x-correlation-id já existir, utiliza o valor recebido.
 * Caso contrário, gera um novo UUID v4.
 *
 * O Correlation ID é propagado no response para rastreabilidade.
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: FastifyRequest, res: FastifyReply, next: () => void) {
    const correlationId =
      (req.headers[CORRELATION_ID_HEADER] as string) || randomUUID();

    req.headers[CORRELATION_ID_HEADER] = correlationId;

    if (typeof res.header === 'function') {
      res.header(CORRELATION_ID_HEADER, correlationId);
    }

    next();
  }
}
