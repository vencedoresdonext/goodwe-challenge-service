import { PrismaClient } from '@prisma/client';
import { ConnectorStatusEnum } from '../../src/common/enums/connector-status.enum';

export async function seedStations(prisma: PrismaClient) {
  console.log('Seeding Stations...');
  const station = await prisma.station.upsert({
    where: { id: 'station-1' },
    update: {},
    create: {
      id: 'station-1',
      name: 'Unidade Paulista',
      address: 'Av. Paulista, 1500 - Bela Vista, São Paulo - SP',
      latitude: -23.561492,
      longitude: -46.656515,
      pricePerKwhCents: 85,
      isActive: true,
    },
  });

  const chargerId = 'charger-1';

  // Verifica se o charger já existe e está vinculado a um usuário (vamos pegar o admin por enquanto ou ignorar se não existir)
  // No caso real o admin cadastraria o charger. Para o seed, assumimos que vamos linkar.
  // const adminRole = await prisma.role.findUnique({ where: { name: 'WEB' } });

  // Vamos buscar o primeiro usuário para usar como recebedor
  const user = await prisma.user.findFirst();

  if (user) {
    const charger = await prisma.charger.upsert({
      where: { id: chargerId },
      update: {},
      create: {
        id: chargerId,
        receiverUserId: user.id,
      },
    });

    await prisma.stationConnector.upsert({
      where: { chargerId },
      update: {},
      create: {
        stationId: station.id,
        chargerId: charger.id,
        connectorType: 'Type2',
        maxPowerKw: 22.0,
        statusId: ConnectorStatusEnum.AVAILABLE,
      },
    });
  }
}
