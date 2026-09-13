import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../../database/repositories/user/user.repository';
import { ProfileOutputDTO } from '../dto/io/profile-io.dto';

@Injectable()
export class FindProfileService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<ProfileOutputDTO> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName || null,
      phone: user.phone || null,
      createdAt: user.createdAt,
    };
  }
}
