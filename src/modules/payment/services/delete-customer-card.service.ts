import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CustomerCardRepository } from 'src/database/repositories';

@Injectable()
export class DeleteCustomerCardService {
  constructor(
    private readonly customerCardRepository: CustomerCardRepository,
  ) {}

  async execute(cardId: string, userId: string): Promise<void> {
    const card = await this.customerCardRepository.findById(cardId);

    if (!card) {
      throw new NotFoundException('Cartão não encontrado');
    }

    if (card.userId !== userId) {
      throw new ForbiddenException('Acesso negado a este cartão');
    }

    await this.customerCardRepository.delete(cardId);
  }
}
