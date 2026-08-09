import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RouteTypeEnum } from '../../../common/enums/route-type.enum';
import { JwtPayload } from 'src/common/interfaces';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokens(
    payload: { sub: string; email: string; roles: number[] },
    routeType: RouteTypeEnum,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let accessSecret: string;
    let refreshSecret: string;

    if (routeType === RouteTypeEnum.APP) {
      accessSecret = this.configService.get<string>('jwt.appSecret') as string;
      refreshSecret = this.configService.get<string>(
        'jwt.appRefreshSecret',
      ) as string;
    } else if (routeType === RouteTypeEnum.WEB) {
      accessSecret = this.configService.get<string>('jwt.webSecret') as string;
      refreshSecret = this.configService.get<string>(
        'jwt.webRefreshSecret',
      ) as string;
    } else {
      throw new Error(`Invalid route type: ${routeType as number}`);
    }

    const expiresIn = this.configService.get<number>('jwt.expiresIn');
    const refreshExpiresIn = this.configService.get<number>(
      'jwt.refreshExpiresIn',
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { secret: accessSecret, expiresIn }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async validateRefreshToken(
    token: string,
    routeType: RouteTypeEnum,
  ): Promise<{ sub: string; email: string; roles: number[] }> {
    let refreshSecret: string;

    if (routeType === RouteTypeEnum.APP) {
      refreshSecret = this.configService.get<string>(
        'jwt.appRefreshSecret',
      ) as string;
    } else if (routeType === RouteTypeEnum.WEB) {
      refreshSecret = this.configService.get<string>(
        'jwt.webRefreshSecret',
      ) as string;
    } else {
      throw new InternalServerErrorException(
        'Erro interno, tente novamente mais tarde',
      );
    }

    try {
      const payload: JwtPayload = await this.jwtService.verifyAsync(token, {
        secret: refreshSecret,
      });
      return {
        sub: payload.sub,

        email: payload.email,

        roles: payload.roles,
      };
    } catch {
      throw new Error('Token inválido ou expirado');
    }
  }
}
