import { PrismaClient } from '@prisma/client';
import { ConnectorStatusEnum } from '../../src/common/enums/connector-status.enum';

export async function seedConnectorStatuses(prisma: PrismaClient) {
  console.log('Seeding ConnectorStatus...');
  for (const key of Object.keys(ConnectorStatusEnum).filter((k) =>
    isNaN(Number(k)),
  )) {
    const id = ConnectorStatusEnum[key as keyof typeof ConnectorStatusEnum];
    await prisma.connectorStatus.upsert({
      where: { id },
      update: { name: key },
      create: { id, name: key },
    });
  }
}
