import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenService } from './token.service';
import { UserRepository } from '../../../database/repositories/user/user.repository';
import { RefreshInputDTO, RefreshOutputDTO } from '../dto/io/refresh-io.dto';

@Injectable()
export class RefreshService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userRepository: UserRepository,
  ) {}

  async execute({
    refreshToken,
    routeType,
  }: RefreshInputDTO): Promise<RefreshOutputDTO> {
    try {
      const payload = await this.tokenService.validateRefreshToken(
        refreshToken,
        routeType,
      );

      const user = await this.userRepository.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      const roleIds = await this.userRepository.findRolesByUserId(user.id);
      if (!roleIds.includes(routeType)) {
        throw new UnauthorizedException(
          `Usuário não tem acesso ao routeType ${routeType}`,
        );
      }

      const tokens = await this.tokenService.generateTokens(
        { sub: user.id, email: user.email, roles: roleIds },
        routeType,
      );

      return tokens;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(
        'Token de atualização inválido ou expirado',
      );
    }
  }
}
