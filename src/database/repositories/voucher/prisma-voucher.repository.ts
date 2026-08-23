import { VoucherDTO } from './dto/voucher.dto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { VoucherRepository } from './voucher.repository';
import { CreateVoucherDTO } from './dto/create-voucher.dto';
import { UpdateVoucherDTO } from './dto/update-voucher.dto';

@Injectable()
export class PrismaVoucherRepository implements VoucherRepository {
  constructor(private readonly prisma: PrismaService) {}
  create(data: CreateVoucherDTO): Promise<VoucherDTO> {
    return this.prisma.voucher.create({
      data,
      select: {
        id: true,
        code: true,
        typeId: true,
        value: true,
        maxUsages: true,
        currentUsages: true,
        maxAmountCents: true,
        validFrom: true,
        validUntil: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  findById(id: string): Promise<VoucherDTO | null> {
    return this.prisma.voucher.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        typeId: true,
        value: true,
        maxUsages: true,
        currentUsages: true,
        maxAmountCents: true,
        validFrom: true,
        validUntil: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  findByCode(code: string): Promise<VoucherDTO | null> {
    return this.prisma.voucher.findUnique({
      where: { code },
      select: {
        id: true,
        code: true,
        typeId: true,
        value: true,
        maxUsages: true,
        currentUsages: true,
        maxAmountCents: true,
        validFrom: true,
        validUntil: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  update(id: string, data: UpdateVoucherDTO): Promise<VoucherDTO> {
    return this.prisma.voucher.update({
      where: { id },
      data,
      select: {
        id: true,
        code: true,
        typeId: true,
        value: true,
        maxUsages: true,
        currentUsages: true,
        maxAmountCents: true,
        validFrom: true,
        validUntil: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  incrementUsage(id: string): Promise<VoucherDTO> {
    return this.prisma.voucher.update({
      where: { id },
      data: { currentUsages: { increment: 1 } },
      select: {
        id: true,
        code: true,
        typeId: true,
        value: true,
        maxUsages: true,
        currentUsages: true,
        maxAmountCents: true,
        validFrom: true,
        validUntil: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deactivate(id: string): Promise<void> {
    await this.prisma.voucher.update({
      where: { id },
      data: { isActive: false },
      select: { id: true },
    });
  }

  findAll(skip: number, take: number): Promise<VoucherDTO[]> {
    return this.prisma.voucher.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      select: {
        id: true,
        code: true,
        typeId: true,
        value: true,
        maxUsages: true,
        currentUsages: true,
        maxAmountCents: true,
        validFrom: true,
        validUntil: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
