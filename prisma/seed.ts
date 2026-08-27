import { PrismaClient } from '@prisma/client';
import { seedRoles } from './seeds/role';
import { seedChargerSessionStatuses } from './seeds/charger-session-status';
import { seedPaymentMethods } from './seeds/payment-method';
import { seedTransactionStatuses } from './seeds/transaction-status';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');
  await seedRoles(prisma);
  await seedChargerSessionStatuses(prisma);
  await seedPaymentMethods(prisma);
  await seedTransactionStatuses(prisma);

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
