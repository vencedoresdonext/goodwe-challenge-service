import { Injectable } from '@nestjs/common';
import { StationOutputDTO } from '../dto/io/station-io.dto';
import { CreateStationInputDTO } from '../dto/io/create-station.dto';
import { StationRepository } from 'src/database/repositories/station';

// TODO: o formulário do front hoje só coleta dados da station (nome, endereço,
// coordenadas, preço/kWh, demanda contratada). Como toda station precisa nascer
// já com um charger + connector vinculados ao usuário (pra aparecer na listagem
// via findByChargerOwner), estou usando um connectorType e maxPowerKw padrão
// aqui. Se quiser que o usuário informe isso na hora de criar, dá pra adicionar
// esses dois campos no CreateStationInputDTO e no modal do front.
const DEFAULT_CONNECTOR_TYPE = 'TYPE2';
const DEFAULT_CONNECTOR_MAX_POWER_KW = 22;

@Injectable()
export class CreateStationWebService {
  constructor(private readonly stationRepository: StationRepository) {}

  async execute(
    userId: string,
    input: CreateStationInputDTO,
  ): Promise<StationOutputDTO> {
    const station = await this.stationRepository.create({
      name: input.name,
      address: input.address,
      latitude: input.latitude,
      longitude: input.longitude,
      pricePerKwhCents: Math.round(input.pricePerKwh * 100),
      contractedDemandKw: input.contractedDemandKw,
      ownerUserId: userId,
      connectorType: DEFAULT_CONNECTOR_TYPE,
      maxPowerKw: DEFAULT_CONNECTOR_MAX_POWER_KW,
    });

    return {
      id: station.id,
      name: station.name,
      latitude: station.latitude,
      longitude: station.longitude,
      address: station.address,
      pricePerKwh: station.pricePerKwhCents / 100,
      contractedDemandKw: station.contractedDemandKw,
      currentConsumptionKw: station.currentConsumptionKw,
      currentSolarGenerationKw: station.currentSolarGenerationKw,
      isActive: station.isActive,
      connectors: station.connectors
        ? station.connectors.map((c) => ({
            id: c.id,
            chargerId: c.chargerId,
            connectorType: c.connectorType,
            maxPowerKw: c.maxPowerKw,
            statusId: c.statusId,
          }))
        : [],
    };
  }
}
