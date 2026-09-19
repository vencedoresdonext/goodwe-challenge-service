import { Module } from '@nestjs/common';
import { PaymentGatewayModule } from '../../integrations/payment-gateway/payment-gateway.module';
import { TokenizeCardController } from './controllers/tokenize-card.controller';
import { FindManyCardsController } from './controllers/find-many-cards.controller';
import { DeleteCardController } from './controllers/delete-card.controller';
import { CreatePixChargeController } from './controllers/create-pix-charge.controller';
import { ProcessCreditCardController } from './controllers/process-credit-card.controller';
import { PaymentWebhookController } from './controllers/payment-webhook.controller';
import { FindManyTransactionsController } from './controllers/find-many-transactions.controller';

import { FindManyTransactionsWebController } from './controllers/find-many-transactions-web.controller';
import { TokenizeCardWebController } from './controllers/tokenize-card-web.controller';
import { FindManyCardsWebController } from './controllers/find-many-cards-web.controller';
import { DeleteCardWebController } from './controllers/delete-card-web.controller';
import { TokenizeCardService } from './services/tokenize-card.service';
import { ListCustomerCardsService } from './services/list-customer-cards.service';
import { DeleteCustomerCardService } from './services/delete-customer-card.service';
import { CreatePixChargeService } from './services/create-pix-charge.service';
import { ProcessCreditCardPaymentService } from './services/process-credit-card-payment.service';
import { HandlePaymentWebhookService } from './services/handle-payment-webhook.service';
import { FindManyTransactionsService } from './services/find-many-transactions.service';
import { FindManyTransactionsWebService } from './services/find-many-transactions-web.service';

@Module({
  imports: [PaymentGatewayModule],
  controllers: [
    TokenizeCardController,
    FindManyCardsController,
    DeleteCardController,
    CreatePixChargeController,
    ProcessCreditCardController,
    PaymentWebhookController,
    FindManyTransactionsController,

    FindManyTransactionsWebController,
    TokenizeCardWebController,
    FindManyCardsWebController,
    DeleteCardWebController,
  ],
  providers: [
    TokenizeCardService,
    ListCustomerCardsService,
    DeleteCustomerCardService,
    CreatePixChargeService,
    ProcessCreditCardPaymentService,
    HandlePaymentWebhookService,
    FindManyTransactionsService,
    FindManyTransactionsWebService,
  ],
})
export class PaymentModule {}
