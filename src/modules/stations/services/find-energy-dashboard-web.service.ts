import { Injectable, NotFoundException } from '@nestjs/common';
import { StationRepository } from '../../../database/repositories/station/station.repository';
import { ChargerSessionRepository } from '../../../database/repositories/charger-session/charger-session.repository';
import { StationDTO } from '../../../database/repositories/station/dto/station.dto';
import {
  EnergyDashboardOutputDTO,
  EnergySeriesOutputDTO,
} from '../dto/io/energy-dashboard-io.dto';
import { EnergyDashboardQueryParamsDTO } from '../dto/query-params/energy-dashboard-query-params.dto';
import {
  aggregateEnergy,
  EnergyPeriod,
  PERIOD_CONFIG,
} from '../utils/energy-aggregation';

const chargerLabel = (index: number) =>
  `Carregador ${String(index + 1).padStart(2, '0')}`;

const installedKwOf = (station: StationDTO) =>
  (station.connectors ?? []).reduce((sum, c) => sum + c.maxPowerKw, 0);

@Injectable()
export class FindEnergyDashboardWebService {
  constructor(
    private readonly stationRepository: StationRepository,
    private readonly chargerSessionRepository: ChargerSessionRepository,
  ) {}

  async execute(
    userId: string,
    query: EnergyDashboardQueryParamsDTO,
  ): Promise<EnergyDashboardOutputDTO> {
    const period: EnergyPeriod = query.period ?? '7d';
    const tzOffsetMinutes = query.tzOffset ?? 180;
    const groupBy = query.stationId ? 'charger' : 'station';

    const { series, contractedDemandKw } = query.stationId
      ? await this.chargerSeries(query.stationId, userId)
      : await this.stationSeries(userId);

    // Janela de busca com folga: sessões longas que começaram antes do
    // período também contribuem para os primeiros intervalos.
    const now = new Date();
    const { bucketMinutes, buckets } = PERIOD_CONFIG[period];
    const windowMs = (buckets + 1) * bucketMinutes * 60_000;
    const sessions =
      await this.chargerSessionRepository.findEnergyByChargerOwner(
        userId,
        new Date(now.getTime() - windowMs),
        now,
        query.stationId,
      );

    const aggregation = aggregateEnergy({
      period,
      tzOffsetMinutes,
      now,
      seriesKeys: series.map((s) => s.key),
      sessions: sessions.map((s) => ({
        seriesKey: (groupBy === 'station' ? s.stationId : s.chargerId) ?? '',
        statusId: s.statusId,
        energyDeliveredKwh: s.energyDeliveredKwh,
        consumedAmountCents: s.consumedAmountCents,
        maxPowerKw: s.maxPowerKw,
        startedAt: s.startedAt,
        finishedAt: s.finishedAt,
      })),
    });

    return {
      period,
      groupBy,
      from: aggregation.from,
      to: aggregation.to,
      bucketMinutes: aggregation.bucketMinutes,
      series,
      points: aggregation.points,
      totals: {
        ...aggregation.totals,
        contractedDemandKw,
        installedKw: series.reduce((sum, s) => sum + s.installedKw, 0),
      },
    };
  }

  private async stationSeries(userId: string) {
    const stations = await this.stationRepository.findByChargerOwner(userId);
    const series: EnergySeriesOutputDTO[] = stations.map((s) => ({
      key: s.id,
      label: s.name,
      installedKw: installedKwOf(s),
      contractedDemandKw: s.contractedDemandKw,
    }));
    return {
      series,
      contractedDemandKw: stations.reduce(
        (sum, s) => sum + s.contractedDemandKw,
        0,
      ),
    };
  }

  private async chargerSeries(stationId: string, userId: string) {
    const station = await this.stationRepository.findByIdFilteredByOwner(
      stationId,
      userId,
    );
    if (!station || !station.connectors?.length) {
      throw new NotFoundException('Estação não encontrada.');
    }
    const series: EnergySeriesOutputDTO[] = station.connectors.map((c, i) => ({
      key: c.chargerId,
      label: chargerLabel(i),
      installedKw: c.maxPowerKw,
    }));
    return { series, contractedDemandKw: station.contractedDemandKw };
  }
}
