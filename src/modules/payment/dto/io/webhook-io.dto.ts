import { PaymentWebhookRequestDTO } from '../request/payment-webhook-request.dto';

export type WebhookInputDTO = {
  payload: PaymentWebhookRequestDTO;
  signature: string;
};
