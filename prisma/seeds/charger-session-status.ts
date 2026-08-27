import { PrismaClient } from '@prisma/client';
import { ChargerSessionStatusEnum } from '../../src/common/enums';

export async function seedChargerSessionStatuses(prisma: PrismaClient) {
  console.log('Seeding ChargerSessionStatus...');
  for (const key of Object.keys(ChargerSessionStatusEnum).filter((k) =>
    isNaN(Number(k)),
  )) {
    const id =
      ChargerSessionStatusEnum[key as keyof typeof ChargerSessionStatusEnum];
    await prisma.chargerSessionStatus.upsert({
      where: { id },
      update: { name: key },
      create: { id, name: key },
    });
  }
}
