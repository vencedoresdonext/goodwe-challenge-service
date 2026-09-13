import { StationDTO } from './dto/station.dto';

export abstract class StationRepository {
  abstract findAll(filters?: { isActive?: boolean }): Promise<StationDTO[]>;
  abstract findById(id: string): Promise<StationDTO | null>;
  abstract findNearby(
    lat: number,
    lng: number,
    radiusKm: number,
  ): Promise<(StationDTO & { distance: number })[]>;
}
