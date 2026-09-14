import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ChargerRepository } from './charger.repository';
import { ChargerDTO } from './dto/charger.dto';

@Injectable()
export class PrismaChargerRepository implements ChargerRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<ChargerDTO | null> {
    return this.prisma.charger.findUnique({
      where: { id },
      select: {
        id: true,
        receiverUserId: true,
        pricePerKwhCents: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
