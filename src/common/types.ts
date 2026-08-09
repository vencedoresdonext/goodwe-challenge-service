import { FastifyRequest } from 'fastify';
import { JwtPayload } from './interfaces';

export type AuthenticatedUser = JwtPayload;

export type HttpRequest = FastifyRequest & { user: AuthenticatedUser };
export type HttpResponse<T> = { message?: string; data?: T };
