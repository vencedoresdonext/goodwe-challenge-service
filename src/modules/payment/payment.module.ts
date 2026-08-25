import { Module } from '@nestjs/common';
import { PaymentGatewayModule } from '../../integrations/payment-gateway/payment-gateway.module';
import { TokenizeCardController } from './controllers/tokenize-card.controller';
import { ListCardsController } from './controllers/list-cards.controller';
import { DeleteCardController } from './controllers/delete-card.controller';
import { CreatePixChargeController } from './controllers/create-pix-charge.controller';
import { ProcessCreditCardController } from './controllers/process-credit-card.controller';
import { PaymentWebhookController } from './controllers/payment-webhook.controller';
import { TokenizeCardService } from './services/tokenize-card.service';
import { ListCustomerCardsService } from './services/list-customer-cards.service';
import { DeleteCustomerCardService } from './services/delete-customer-card.service';
import { CreatePixChargeService } from './services/create-pix-charge.service';
import { ProcessCreditCardPaymentService } from './services/process-credit-card-payment.service';
import { HandlePaymentWebhookService } from './services/handle-payment-webhook.service';

@Module({
  imports: [PaymentGatewayModule],
  controllers: [
    TokenizeCardController,
    ListCardsController,
    DeleteCardController,
    CreatePixChargeController,
    ProcessCreditCardController,
    PaymentWebhookController,
  ],
  providers: [
    TokenizeCardService,
    ListCustomerCardsService,
    DeleteCustomerCardService,
    CreatePixChargeService,
    ProcessCreditCardPaymentService,
    HandlePaymentWebhookService,
  ],
})
export class PaymentModule {}
