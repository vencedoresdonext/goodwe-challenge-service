import {
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserRepository } from '../../../database/repositories/user/user.repository';
import { TokenService } from './token.service';
import { LoginInputDTO, LoginOutputDTO } from '../dto/io/login-io.dto';
import * as bcrypt from 'bcrypt';
import {
  RateLimitCacheService,
  RateLimitData,
} from '../../../cache/services/rate-limit-cache.service';

@Injectable()
export class LoginService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly rateLimitCacheService: RateLimitCacheService,
  ) {}

  async execute({
    email,
    password,
    routeType,
  }: LoginInputDTO): Promise<LoginOutputDTO> {
    let rateLimitData = await this.rateLimitCacheService.get(email);

    if (!rateLimitData) {
      rateLimitData = { attempts: 0, blockCount: 0, blockedUntil: 0 };
    }

    const now = Date.now();
    if (rateLimitData.blockedUntil > now) {
      const remainingMinutes = Math.ceil(
        (rateLimitData.blockedUntil - now) / (60 * 1000),
      );

      throw new HttpException(
        `Muitas tentativas falhas. Conta bloqueada. Tente novamente em ${remainingMinutes} minuto(s).`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      await this.registerFailure(email, rateLimitData);

      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      await this.registerFailure(email, rateLimitData);
    }

    if (rateLimitData.attempts > 0 || rateLimitData.blockCount > 0) {
      await this.rateLimitCacheService.delete(email);
    }

    const roleIds = await this.userRepository.findRolesByUserId(user.id);

    if (!roleIds.includes(routeType)) {
      throw new UnauthorizedException(`Usuário não tem acesso ao ${routeType}`);
    }

    const { accessToken, refreshToken } =
      await this.tokenService.generateTokens(
        { sub: user.id, email: user.email, roles: roleIds },
        routeType,
      );

    return {
      accessToken,
      refreshToken,
    };
  }

  private async registerFailure(
    rateLimitKey: string,
    rateLimitData: RateLimitData,
  ): Promise<never> {
    rateLimitData.attempts += 1;

    if (rateLimitData.attempts >= 3) {
      rateLimitData.blockCount += 1;

      const blockDurationMinutes =
        20 * Math.pow(2, rateLimitData.blockCount - 1);

      rateLimitData.blockedUntil =
        Date.now() + blockDurationMinutes * 60 * 1000;

      rateLimitData.attempts = 0;

      await this.rateLimitCacheService.set(rateLimitKey, rateLimitData);

      throw new HttpException(
        `Muitas tentativas falhas. Conta bloqueada por ${blockDurationMinutes} minutos.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    await this.rateLimitCacheService.set(rateLimitKey, rateLimitData);

    throw new UnauthorizedException('Credenciais inválidas');
  }
}
