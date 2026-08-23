import { PrismaClient } from '@prisma/client';
import { VoucherTypeEnum } from '../../src/common/enums';

export async function seedVoucherTypes(prisma: PrismaClient) {
  console.log('Seeding VoucherType...');
  for (const key of Object.keys(VoucherTypeEnum).filter((k) =>
    isNaN(Number(k)),
  )) {
    const id = VoucherTypeEnum[key as keyof typeof VoucherTypeEnum];
    await prisma.voucherType.upsert({
      where: { id },
      update: { name: key },
      create: { id, name: key },
    });
  }
}
