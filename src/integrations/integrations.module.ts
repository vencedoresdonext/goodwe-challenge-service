import { Module } from '@nestjs/common';
import { HttpClientModule } from './http/http-client.module';

/**
 * Módulo de integrações com APIs externas.
 *
 * Adicione novos módulos de integração aqui. Exemplo:
 * - PaymentModule (gateway de pagamento)
 * - NotificationModule (serviço de notificações)
 * - StorageModule (S3, GCS, etc)
 */
@Module({
  imports: [HttpClientModule],
  exports: [HttpClientModule],
})
export class IntegrationsModule {}
