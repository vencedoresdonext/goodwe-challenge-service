import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ROUTE_TYPE_KEY } from '../decorators/route-type.decorator';
import { RouteTypeEnum } from '../enums/route-type.enum';
import { IS_PUBLIC_KEY } from '../constants';
import { JwtPayload } from '../interfaces';
import { HttpRequest } from '../types';

/**
 * Guard de autenticação JWT.
 * Verifica o token Bearer no header Authorization.
 * Rotas marcadas com @Public() fazem bypass.
 *
 * O payload do JWT é injetado em `request.user`.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<HttpRequest>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token não fornecido');
    }

    try {
      const routeType = this.reflector.getAllAndOverride<RouteTypeEnum>(
        ROUTE_TYPE_KEY,
        [context.getHandler(), context.getClass()],
      );

      let secret = '';
      if (routeType === RouteTypeEnum.APP) {
        secret = this.configService.get<string>('jwt.appSecret') || '';
      } else if (routeType === RouteTypeEnum.WEB) {
        secret = this.configService.get<string>('jwt.webSecret') || '';
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret,
      });
      request.user = payload;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    return true;
  }

  private extractTokenFromHeader(request: HttpRequest): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
