import { CustomerCardDTO } from './dto/customer-card.dto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CustomerCardRepository } from './customer-card.repository';
import { CreateCustomerCardDTO } from './dto/create-customer-card.dto';

@Injectable()
export class PrismaCustomerCardRepository implements CustomerCardRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateCustomerCardDTO): Promise<CustomerCardDTO> {
    return this.prisma.customerCard.create({
      data,
      select: {
        id: true,
        userId: true,
        gatewayToken: true,
        lastFourDigits: true,
        brand: true,
        holderName: true,
        expiresAt: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  findById(id: string): Promise<CustomerCardDTO | null> {
    return this.prisma.customerCard.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        gatewayToken: true,
        lastFourDigits: true,
        brand: true,
        holderName: true,
        expiresAt: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  findByUserId(userId: string): Promise<CustomerCardDTO[]> {
    return this.prisma.customerCard.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        gatewayToken: true,
        lastFourDigits: true,
        brand: true,
        holderName: true,
        expiresAt: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  findByGatewayToken(token: string): Promise<CustomerCardDTO | null> {
    return this.prisma.customerCard.findFirst({
      where: { gatewayToken: token },
      select: {
        id: true,
        userId: true,
        gatewayToken: true,
        lastFourDigits: true,
        brand: true,
        holderName: true,
        expiresAt: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.customerCard.delete({
      where: { id },
      select: { id: true },
    });
  }

  async setDefault(userId: string, cardId: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.customerCard.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      }),
      this.prisma.customerCard.update({
        where: { id: cardId },
        data: { isDefault: true },
      }),
    ]);
  }
}
