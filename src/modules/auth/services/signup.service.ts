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
        roles: {
          create: {
            roleId: input.routeType,
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        if (error.code === 'P2002')
          throw new ConflictException('Email ou telefone já está em uso.');
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
