import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../../database/repositories/user/user.repository';
import { SignupInputDTO, SignupOutputDTO } from '../dto/io/signup-io.dto';
import { TokenService } from './token.service';

@Injectable()
export class SignupService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(input: SignupInputDTO): Promise<SignupOutputDTO> {
    const hashedPassword = await bcrypt.hash(input.password, 10);

    let user;
    try {
      user = await this.userRepository.create({
        email: input.email,
        fullName: input.fullName || undefined,
        phone: input.phone || undefined,
        password: hashedPassword,
        roleId: input.routeType,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Email ou telefone já está em uso.');
        }

        if (error.code === 'P2003') {
          console.error('🚨 ERRO DE CHAVE ESTRANGEIRA:');
          console.error('Campo:', error.meta?.field_name);
          console.error('Valor:', error.meta?.field_value);
          console.error('Relação:', error.meta?.relation_name);
        }
      }
      throw error;
    }

    const { accessToken, refreshToken } =
      await this.tokenService.generateTokens(
        {
          sub: user.id,
          email: user.email,
          roles: [input.routeType],
        },
        input.routeType,
      );

    return {
      accessToken,
      refreshToken,
    };
  }
}
