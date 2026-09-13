import { Test, TestingModule } from '@nestjs/testing';
import { TokenizeCardService } from './tokenize-card.service';
import { CustomerCardRepository } from '../../../database/repositories';
import { PaymentGatewayPort } from '../../../integrations/payment-gateway/payment-gateway.port';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('TokenizeCardService', () => {
  let service: TokenizeCardService;
  let customerCardRepository: any;
  let paymentGateway: any;

  beforeEach(async () => {
    customerCardRepository = {
      findByGatewayToken: vi.fn(),
      findByUserId: vi.fn(),
      create: vi.fn(),
    };

    paymentGateway = {
      tokenizeCard: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenizeCardService,
        { provide: CustomerCardRepository, useValue: customerCardRepository },
        { provide: PaymentGatewayPort, useValue: paymentGateway },
      ],
    }).compile();

    service = module.get<TokenizeCardService>(TokenizeCardService);
  });

  describe('execute', () => {
    const input = {
      userId: 'user-1',
      cardNumber: '1234567890123456',
      holderName: 'Test Name',
      expirationMonth: 12,
      expirationYear: 2025,
      securityCode: '123',
      identificationType: 'CPF',
      identificationNumber: '11111111111',
    };

    const mockDate = new Date('2025-12-31');

    it('should return existing card if token matches and belongs to user', async () => {
      paymentGateway.tokenizeCard.mockResolvedValue({
        gatewayToken: 'token-123',
        lastFourDigits: '3456',
        brand: 'visa',
        expiresAt: mockDate,
      });

      customerCardRepository.findByGatewayToken.mockResolvedValue({
        id: 'card-1',
        userId: 'user-1',
        lastFourDigits: '3456',
        brand: 'visa',
        holderName: 'Test Name',
        expiresAt: mockDate,
        isDefault: true,
      });

      const result = await service.execute(input);

      expect(paymentGateway.tokenizeCard).toHaveBeenCalledWith({
        cardNumber: input.cardNumber,
        holderName: input.holderName,
        expirationMonth: input.expirationMonth,
        expirationYear: input.expirationYear,
        securityCode: input.securityCode,
        identificationType: input.identificationType,
        identificationNumber: input.identificationNumber,
      });

      expect(result).toEqual({
        id: 'card-1',
        lastFourDigits: '3456',
        brand: 'visa',
        holderName: 'Test Name',
        expiresAt: mockDate,
        isDefault: true,
      });

      expect(customerCardRepository.create).not.toHaveBeenCalled();
    });

    it('should create new card and set as default if user has no cards', async () => {
      paymentGateway.tokenizeCard.mockResolvedValue({
        gatewayToken: 'token-123',
        lastFourDigits: '3456',
        brand: 'visa',
        expiresAt: mockDate,
      });

      customerCardRepository.findByGatewayToken.mockResolvedValue(null);
      customerCardRepository.findByUserId.mockResolvedValue([]);

      customerCardRepository.create.mockResolvedValue({
        id: 'card-new',
        lastFourDigits: '3456',
        brand: 'visa',
        holderName: 'Test Name',
        expiresAt: mockDate,
        isDefault: true,
      });

      const result = await service.execute(input);

      expect(customerCardRepository.create).toHaveBeenCalledWith({
        userId: 'user-1',
        gatewayToken: 'token-123',
        lastFourDigits: '3456',
        brand: 'visa',
        holderName: 'Test Name',
        expiresAt: mockDate,
        isDefault: true, // First card
      });

      expect(result).toEqual({
        id: 'card-new',
        lastFourDigits: '3456',
        brand: 'visa',
        holderName: 'Test Name',
        expiresAt: mockDate,
        isDefault: true,
      });
    });

    it('should create new card and not set as default if user already has cards', async () => {
      paymentGateway.tokenizeCard.mockResolvedValue({
        gatewayToken: 'token-123',
        lastFourDigits: '3456',
        brand: 'visa',
        expiresAt: mockDate,
      });

      customerCardRepository.findByGatewayToken.mockResolvedValue(null);
      customerCardRepository.findByUserId.mockResolvedValue([
        { id: 'card-old' },
      ]);

      customerCardRepository.create.mockResolvedValue({
        id: 'card-new',
        lastFourDigits: '3456',
        brand: 'visa',
        holderName: 'Test Name',
        expiresAt: mockDate,
        isDefault: false,
      });

      await service.execute(input);

      expect(customerCardRepository.create).toHaveBeenCalledWith({
        userId: 'user-1',
        gatewayToken: 'token-123',
        lastFourDigits: '3456',
        brand: 'visa',
        holderName: 'Test Name',
        expiresAt: mockDate,
        isDefault: false, // Not the first card
      });
    });
  });
});
