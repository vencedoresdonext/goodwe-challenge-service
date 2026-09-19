import { PrismaService } from 'src/database/prisma.service';

/**
 * Helper function to clean the database before each integration test.
 * Note: Table order matters to respect foreign key constraints.
 */
export async function cleanDatabase(prisma: PrismaService) {
  // Disabling foreign key checks to make truncation easier if needed,
  // or delete in proper order.

  await prisma.paymentTransaction.deleteMany();
  await prisma.chargerSession.deleteMany();
  await prisma.stationConnector.deleteMany();
  await prisma.charger.deleteMany();
  await prisma.station.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.customerCard.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.user.deleteMany();

  // Seed enums required for tests
  await prisma.connectorStatus.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: 'AVAILABLE' },
  });
  await prisma.chargerSessionStatus.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: 'AWAITING_PAYMENT' },
  });
  await prisma.chargerSessionStatus.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, name: 'AUTHORIZED' },
  });
  await prisma.chargerSessionStatus.upsert({
    where: { id: 3 },
    update: {},
    create: { id: 3, name: 'CHARGING' },
  });
  await prisma.chargerSessionStatus.upsert({
    where: { id: 4 },
    update: {},
    create: { id: 4, name: 'FINISHED' },
  });
  await prisma.transactionStatus.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: 'PENDING' },
  });
  await prisma.transactionStatus.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, name: 'AUTHORIZED' },
  });
  await prisma.transactionStatus.upsert({
    where: { id: 3 },
    update: {},
    create: { id: 3, name: 'CAPTURED' },
  });
  await prisma.paymentMethod.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: 'CREDIT_CARD' },
  });
  await prisma.paymentMethod.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, name: 'PIX' },
  });
}
