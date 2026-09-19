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
import { TokenizeCardService } from './tokenize-card.service';
import { PaymentGatewayPort } from '../../../integrations/payment-gateway/payment-gateway.port';
import { cleanDatabase } from '../../../common/test-utils/prisma-test-utils';

describe('TokenizeCardService (Integration)', () => {
  let service: TokenizeCardService;
  let prisma: PrismaService;
  let module: TestingModule;
  let paymentGatewayMock: any;

  beforeAll(async () => {
    paymentGatewayMock = {
      tokenizeCard: vi.fn(),
    };

    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule],
      providers: [
        TokenizeCardService,
        { provide: PaymentGatewayPort, useValue: paymentGatewayMock },
      ],
    }).compile();

    service = module.get<TokenizeCardService>(TokenizeCardService);
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

  it('should tokenize card and save to database', async () => {
    const user = await prisma.user.create({
      data: { email: 'user@test.com', password: 'pwd' },
    });

    paymentGatewayMock.tokenizeCard.mockResolvedValue({
      gatewayToken: 'ext-tkn',
      lastFourDigits: '4321',
      brand: 'Mastercard',
      expiresAt: new Date(),
    });

    const result = await service.execute({
      userId: user.id,
      cardNumber: '0000000000004321',
      expirationMonth: 12,
      expirationYear: 2030,
      securityCode: '123',
      holderName: 'Test User',
      identificationType: 'CPF',
      identificationNumber: '11122233344',
    });

    expect(result.id).toBeDefined();
    expect(result.lastFourDigits).toBe('4321');

    const dbCard = await prisma.customerCard.findUnique({
      where: { id: result.id },
    });
    expect(dbCard?.gatewayToken).toBe('ext-tkn');
    expect(dbCard?.userId).toBe(user.id);
  });
});
