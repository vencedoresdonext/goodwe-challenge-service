import { PrismaClient } from '@prisma/client';
import { seedRoles } from './seeds/role';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');
  await seedRoles(prisma);
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
