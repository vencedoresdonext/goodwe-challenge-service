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
import { CreatePixChargeService } from './create-pix-charge.service';
import { PaymentGatewayPort } from '../../../integrations/payment-gateway/payment-gateway.port';
import { cleanDatabase } from '../../../common/test-utils/prisma-test-utils';

describe('CreatePixChargeService (Integration)', () => {
  let service: CreatePixChargeService;
  let prisma: PrismaService;
  let module: TestingModule;
  let paymentGatewayMock: any;

  beforeAll(async () => {
    paymentGatewayMock = {
      createPixCharge: vi.fn(),
    };

    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule],
      providers: [
        CreatePixChargeService,
        { provide: PaymentGatewayPort, useValue: paymentGatewayMock },
      ],
    }).compile();

    service = module.get<CreatePixChargeService>(CreatePixChargeService);
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

  it('should create a PIX charge successfully', async () => {
    const user = await prisma.user.create({
      data: { email: 'user@test.com', password: 'pwd' },
    });

    paymentGatewayMock.createPixCharge.mockResolvedValue({
      gatewayTransactionId: 'ext-pix-123',
      pixPayload: 'mock-payload',
      pixTxId: 'mock-tx-id',
      pixExpiresAt: new Date(Date.now() + 3600000),
      qrCodeBase64: 'mock-base64',
    });

    const charger = await prisma.charger.create({
      data: { receiverUserId: user.id },
    });

    const result = await service.execute({
      userId: user.id,
      chargerId: charger.id,
      amountCents: 5000,
      idempotencyKey: 'idem-pix-1',
      payerEmail: 'test@test.com',
      description: 'Pix Charge',
    });

    expect(result.transactionId).toBeDefined();
    expect(result.pixPayload).toBe('mock-payload');

    const tx = await prisma.paymentTransaction.findUnique({
      where: { id: result.transactionId },
    });
    expect(tx?.statusId).toBe(1); // PENDING
    expect(tx?.gatewayTransactionId).toBe('ext-pix-123');
  });
});
