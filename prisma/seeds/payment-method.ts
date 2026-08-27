import { PrismaClient } from '@prisma/client';
import { PaymentMethodEnum } from '../../src/common/enums';

export async function seedPaymentMethods(prisma: PrismaClient) {
  console.log('Seeding PaymentMethod...');
  for (const key of Object.keys(PaymentMethodEnum).filter((k) =>
    isNaN(Number(k)),
  )) {
    const id = PaymentMethodEnum[key as keyof typeof PaymentMethodEnum];
    await prisma.paymentMethod.upsert({
      where: { id },
      update: { name: key },
      create: { id, name: key },
    });
  }
}
