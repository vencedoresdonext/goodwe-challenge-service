import { PrismaClient } from '@prisma/client';
import { TransactionStatusEnum } from '../../src/common/enums';

export async function seedTransactionStatuses(prisma: PrismaClient) {
  console.log('Seeding TransactionStatus...');
  for (const key of Object.keys(TransactionStatusEnum).filter((k) =>
    isNaN(Number(k)),
  )) {
    const id = TransactionStatusEnum[key as keyof typeof TransactionStatusEnum];
    await prisma.transactionStatus.upsert({
      where: { id },
      update: { name: key },
      create: { id, name: key },
    });
  }
}
