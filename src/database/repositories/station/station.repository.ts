import {
  CreateStationChargerDTO,
  CreateStationDTO,
} from './dto/create-station.dto';
import { StationConnectorDTO } from './dto/station-connector.dto';
import { StationDTO } from './dto/station.dto';
import { UpdateStationChargerDTO } from './dto/update-station-charger.dto';

export abstract class StationRepository {
  abstract findAll(filters?: { isActive?: boolean }): Promise<StationDTO[]>;
  abstract findById(id: string): Promise<StationDTO | null>;
  abstract findNearby(
    lat: number,
    lng: number,
    radiusKm: number,
  ): Promise<(StationDTO & { distance: number })[]>;
  abstract findByChargerOwner(userId: string): Promise<StationDTO[]>;
  abstract findByIdFilteredByOwner(
    stationId: string,
    userId: string,
  ): Promise<StationDTO | null>;
  abstract create(data: CreateStationDTO): Promise<StationDTO>;
  abstract addCharger(
    stationId: string,
    ownerUserId: string,
    data: CreateStationChargerDTO,
  ): Promise<StationConnectorDTO>;
  abstract findConnectorByChargerId(
    chargerId: string,
  ): Promise<StationConnectorDTO | null>;
  abstract updateCharger(
    chargerId: string,
    data: UpdateStationChargerDTO,
  ): Promise<StationConnectorDTO>;
}
