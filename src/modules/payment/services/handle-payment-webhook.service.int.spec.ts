import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import {
  describe,
  it,
  expect,
  beforeEach,
  beforeAll,
  afterAll,
  vi,
} from 'vitest';
import { DatabaseModule } from '../../../database/database.module';
import { PrismaService } from '../../../database/prisma.service';
import { HandlePaymentWebhookService } from './handle-payment-webhook.service';
import { cleanDatabase } from '../../../common/test-utils/prisma-test-utils';
import { PaymentGatewayPort } from '../../../integrations/payment-gateway/payment-gateway.port';

describe('HandlePaymentWebhookService (Integration)', () => {
  let service: HandlePaymentWebhookService;
  let prisma: PrismaService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule],
      providers: [
        HandlePaymentWebhookService,
        {
          provide: PaymentGatewayPort,
          useValue: {
            chargeCreditCard: vi.fn(),
            tokenizeCard: vi.fn(),
            deleteCardToken: vi.fn(),
            validateWebhookSignature: vi.fn().mockReturnValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<HandlePaymentWebhookService>(
      HandlePaymentWebhookService,
    );
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await module.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  it('should update transaction status on webhook', async () => {
    const user = await prisma.user.create({
      data: { email: 'user@test.com', password: 'pwd' },
    });

    const tx = await prisma.paymentTransaction.create({
      data: {
        userId: user.id,
        amountCents: 5000,
        statusId: 1, // PENDING
        paymentMethodId: 1, // Credit Card
        idempotencyKey: 'idem-1',
        gatewayTransactionId: 'ext-webhook-1',
        finalAmountCents: 5000,
      },
    });

    await service.execute({
      signature: 'valid-sig',
      payload: {
        action: 'payment.updated',
        data: { id: 'ext-webhook-1', statusId: 'approved' },
      },
    });

    const updatedTx = await prisma.paymentTransaction.findUnique({
      where: { id: tx.id },
    });
    expect(updatedTx?.statusId).toBe(3); // CAPTURED
  });

  it('should ignore webhook if transaction is not found', async () => {
    await expect(
      service.execute({
        signature: 'valid-sig',
        payload: {
          action: 'payment.updated',
          data: { id: 'non-existent', statusId: 'approved' },
        } as any,
      }),
    ).resolves.not.toThrow();
  });
});
