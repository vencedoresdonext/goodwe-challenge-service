import { Injectable, Logger } from '@nestjs/common';
import { TokenizeCardInputDTO } from '../dto/io/tokenize-card-io.dto';
import { TokenizeCardOutputDTO } from '../dto/io/tokenize-card-io.dto';
import { CustomerCardRepository } from 'src/database/repositories';
import { PaymentGatewayPort } from 'src/integrations/payment-gateway/payment-gateway.port';

@Injectable()
export class TokenizeCardService {
  private readonly logger = new Logger(TokenizeCardService.name);

  constructor(
    private readonly customerCardRepository: CustomerCardRepository,
    private readonly paymentGateway: PaymentGatewayPort,
  ) {}

  async execute(input: TokenizeCardInputDTO): Promise<TokenizeCardOutputDTO> {
    this.logger.log(`Tokenizing card for user ${input.userId}`);

    const tokenResult = await this.paymentGateway.tokenizeCard({
      cardNumber: input.cardNumber,
      holderName: input.holderName,
      expirationMonth: input.expirationMonth,
      expirationYear: input.expirationYear,
      securityCode: input.securityCode,
      identificationType: input.identificationType,
      identificationNumber: input.identificationNumber,
    });

    const existingCard = await this.customerCardRepository.findByGatewayToken(
      tokenResult.gatewayToken,
    );

    if (existingCard && existingCard.userId === input.userId) {
      return {
        id: existingCard.id,
        lastFourDigits: existingCard.lastFourDigits,
        brand: existingCard.brand,
        holderName: existingCard.holderName,
        expiresAt: existingCard.expiresAt,
        isDefault: existingCard.isDefault,
      };
    }

    const userCards = await this.customerCardRepository.findByUserId(
      input.userId,
    );
    const isFirstCard = userCards.length === 0;

    const card = await this.customerCardRepository.create({
      userId: input.userId,
      gatewayToken: tokenResult.gatewayToken,
      lastFourDigits: tokenResult.lastFourDigits,
      brand: tokenResult.brand,
      holderName: input.holderName,
      expiresAt: tokenResult.expiresAt,
      isDefault: isFirstCard,
    });

    this.logger.log(`Card tokenized successfully: ${card.id}`);

    return {
      id: card.id,
      lastFourDigits: card.lastFourDigits,
      brand: card.brand,
      holderName: card.holderName,
      expiresAt: card.expiresAt,
      isDefault: card.isDefault,
    };
  }
}
