import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { UserRepository } from '../../../database/repositories/user/user.repository';
import { ProfileOutputDTO } from '../dto/io/profile-io.dto';
import { UpdateProfileRequestDTO } from '../dto/request/update-profile-request.dto';

@Injectable()
export class UpdateProfileService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    userId: string,
    data: UpdateProfileRequestDTO,
  ): Promise<ProfileOutputDTO> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (data.phone && data.phone !== user.phone) {
      const existingUserPhone = await this.userRepository.findByPhone(
        data.phone,
      );
      if (existingUserPhone) {
        throw new ConflictException('Telefone já está em uso.');
      }
    }

    const updatedUser = await this.userRepository.update(userId, data);

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName || null,
      phone: updatedUser.phone || null,
      createdAt: updatedUser.createdAt,
    };
  }
}
