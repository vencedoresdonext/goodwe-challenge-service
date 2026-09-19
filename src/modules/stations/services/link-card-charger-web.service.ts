import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ChargerRepository } from '../../../database/repositories/charger/charger.repository';
import { CustomerCardRepository } from '../../../database/repositories/customer-card/customer-card.repository';
import { ChargerDTO } from '../../../database/repositories/charger/dto/charger.dto';

@Injectable()
export class LinkCardToChargerWebService {
  constructor(
    private readonly chargerRepository: ChargerRepository,
    private readonly customerCardRepository: CustomerCardRepository,
  ) {}

  async execute(
    userId: string,
    chargerId: string,
    cardId: string,
  ): Promise<ChargerDTO> {
    const charger = await this.chargerRepository.findById(chargerId);
    if (!charger) {
      throw new NotFoundException('Carregador não encontrado.');
    }

    if (charger.receiverUserId !== userId) {
      throw new ForbiddenException('Este carregador não pertence a você.');
    }

    const card = await this.customerCardRepository.findById(cardId);
    if (!card) {
      throw new NotFoundException('Cartão não encontrado.');
    }

    if (card.userId !== userId) {
      throw new ForbiddenException('Este cartão não pertence a você.');
    }

    return this.chargerRepository.updateReceiverCard(chargerId, cardId);
  }
}
