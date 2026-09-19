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
import { ProcessCreditCardPaymentService } from './process-credit-card-payment.service';
import { PaymentGatewayPort } from '../../../integrations/payment-gateway/payment-gateway.port';
import { cleanDatabase } from '../../../common/test-utils/prisma-test-utils';
import { NotFoundException } from '@nestjs/common';

describe('ProcessCreditCardPaymentService (Integration)', () => {
  let service: ProcessCreditCardPaymentService;
  let prisma: PrismaService;
  let module: TestingModule;
  let paymentGatewayMock: any;

  beforeAll(async () => {
    paymentGatewayMock = {
      processCreditCardPayment: vi.fn(),
    };

    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule],
      providers: [
        ProcessCreditCardPaymentService,
        { provide: PaymentGatewayPort, useValue: paymentGatewayMock },
      ],
    }).compile();

    service = module.get<ProcessCreditCardPaymentService>(
      ProcessCreditCardPaymentService,
    );
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await module.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
    vi.clearAllMocks();
  });

  it('should process credit card payment successfully', async () => {
    const user = await prisma.user.create({
      data: { email: 'user@test.com', password: 'pwd' },
    });
    const card = await prisma.customerCard.create({
      data: {
        userId: user.id,
        gatewayToken: 'ext-token',
        lastFourDigits: '1234',
        brand: 'Visa',
        holderName: 'Test',
        expiresAt: new Date(),
      },
    });

    paymentGatewayMock.chargeCreditCard = vi.fn().mockResolvedValue({
      gatewayTransactionId: 'ext-cc-123',
      statusId: 'approved',
    });

    const charger = await prisma.charger.create({
      data: { receiverUserId: user.id },
    });

    const result = await service.execute({
      userId: user.id,
      customerCardId: card.id,
      chargerId: charger.id,
      amountCents: 5000,
      installments: 1,
      idempotencyKey: 'idem-cc-1',
      payerEmail: 'test@test.com',
      description: 'Test Charge',
    });

    expect(result.transactionId).toBeDefined();
    expect(result.statusId).toBe(2); // AUTHORIZED

    const tx = await prisma.paymentTransaction.findUnique({
      where: { id: result.transactionId },
    });
    expect(tx?.statusId).toBe(2); // AUTHORIZED
    expect(tx?.customerCardId).toBe(card.id);
  });

  it('should throw NotFoundException if card is not found', async () => {
    const user = await prisma.user.create({
      data: { email: 'user@test.com', password: 'pwd' },
    });

    await expect(
      service.execute({
        userId: user.id,
        customerCardId: 'non-existent',
        chargerId: 'some-charger',
        amountCents: 5000,
        installments: 1,
        idempotencyKey: 'idem-cc-2',
        payerEmail: 'test@test.com',
        description: 'Test Charge',
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
