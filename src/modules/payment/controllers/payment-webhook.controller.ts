import { Controller, Post, Body, Headers } from '@nestjs/common';
import { HandlePaymentWebhookService } from '../services/handle-payment-webhook.service';
import { Public } from '../../../common/decorators/public.decorator';
import { PaymentWebhookRequestDTO } from '../dto/request/payment-webhook-request.dto';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Pagamentos')
export class PaymentWebhookController {
  constructor(
    private readonly handleWebhookService: HandlePaymentWebhookService,
  ) {}

  @Public()
  @Post('webhooks/payment')
  @ApiOperation({ summary: 'Rota para receber webhooks de pagamento' })
  @ApiBody({ type: PaymentWebhookRequestDTO })
  async handle(
    @Body() body: PaymentWebhookRequestDTO,
    @Headers('x-signature') signature: string,
  ): Promise<{ received: boolean }> {
    await this.handleWebhookService.execute({
      payload: body,
      signature: signature || '',
    });

    return { received: true };
  }
}
