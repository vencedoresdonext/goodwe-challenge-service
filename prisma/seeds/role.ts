import { PrismaClient } from '@prisma/client';
import { RouteTypeEnum } from '../../src/common/enums/route-type.enum';

export async function seedRoles(prisma: PrismaClient) {
  console.log('Seeding roles...');
  const roles = [
    { id: RouteTypeEnum.APP, name: 'App' },
    { id: RouteTypeEnum.WEB, name: 'Web' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: {},
      create: {
        ...role,
      },
    });
  }
  console.log('Roles seeded.');
}
