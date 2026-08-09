import { Injectable, BadRequestException } from '@nestjs/common';
import { UserRepository } from '../../../database/repositories/user/user.repository';
import { TokenService } from './token.service';
import { SignupInputDTO, SignupOutputDTO } from '../dto/io/signup-io.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SignupService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(input: SignupInputDTO): Promise<SignupOutputDTO> {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new BadRequestException('Email já está em uso');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const user = await this.userRepository.create({
      email: input.email,
      password: hashedPassword,
    });

    await this.userRepository.addRoleToUser(user.id, input.routeType);

    const { accessToken, refreshToken } =
      await this.tokenService.generateTokens(
        { sub: user.id, email: user.email, roles: [input.routeType] },
        input.routeType,
      );

    return {
      accessToken,
      refreshToken,
    };
  }
}
