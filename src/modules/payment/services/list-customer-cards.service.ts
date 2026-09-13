import { Injectable } from '@nestjs/common';
import { CustomerCardRepository } from '../../../database/repositories';
import { ListCustomerCardsOutputDTO } from '../dto/io/list-customer-cards-io.dto';

@Injectable()
export class ListCustomerCardsService {
  constructor(
    private readonly customerCardRepository: CustomerCardRepository,
  ) {}

  async execute(userId: string): Promise<ListCustomerCardsOutputDTO[]> {
    const cards = await this.customerCardRepository.findByUserId(userId);

    return cards.map((card) => ({
      id: card.id,
      lastFourDigits: card.lastFourDigits,
      brand: card.brand,
      holderName: card.holderName,
      expiresAt: card.expiresAt,
      isDefault: card.isDefault,
    }));
  }
}
