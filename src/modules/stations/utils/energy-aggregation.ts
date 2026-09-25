export type EnergyPeriod = '24h' | '7d' | '30d';

export const PERIOD_CONFIG: Record<
  EnergyPeriod,
  { bucketMinutes: number; buckets: number }
> = {
  '24h': { bucketMinutes: 60, buckets: 24 },
  '7d': { bucketMinutes: 180, buckets: 56 },
  '30d': { bucketMinutes: 1440, buckets: 30 },
};

const ACTIVE_STATUSES = new Set([2, 3]); // AUTHORIZED, CHARGING
const MS_PER_HOUR = 3_600_000;
const MIN_DURATION_H = 1 / 60;

export type EnergySessionInput = {
  seriesKey: string;
  statusId: number;
  energyDeliveredKwh: number;
  consumedAmountCents: number;
  maxPowerKw: number | null;
  startedAt: Date;
  finishedAt: Date | null;
};

export type SeriesPointValue = { energyKwh: number; avgPowerKw: number };

export type EnergyPoint = {
  start: string;
  end: string;
  series: Record<string, SeriesPointValue>;
  totalEnergyKwh: number;
  avgPowerKw: number;
  peakPowerKw: number;
  revenueCents: number;
  sessions: number;
};

export type EnergyAggregation = {
  from: string;
  to: string;
  bucketMinutes: number;
  points: EnergyPoint[];
  totals: {
    energyKwh: number;
    revenueCents: number;
    sessions: number;
    avgPowerKw: number;
    peakPowerKw: number;
    peakAt: string | null;
  };
};

const round = (value: number, digits = 3) => {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
};

export function alignToBucket(
  date: Date,
  bucketMinutes: number,
  tzOffsetMinutes: number,
): number {
  const bucketMs = bucketMinutes * 60_000;
  const offsetMs = tzOffsetMinutes * 60_000;
  const local = date.getTime() - offsetMs;
  return Math.floor(local / bucketMs) * bucketMs + offsetMs;
}

type Block = {
  seriesKey: string;
  start: number;
  end: number;
  powerKw: number;
  revenuePerHour: number;
};

function toBlock(s: EnergySessionInput, now: number): Block | null {
  const start = s.startedAt.getTime();
  let end: number;
  if (s.finishedAt) end = s.finishedAt.getTime();
  else if (ACTIVE_STATUSES.has(s.statusId)) end = now;
  else return null; // sessão sem fim e sem estar ativa: não dá pra estimar

  if (end <= start || s.energyDeliveredKwh <= 0) return null;

  const durationH = Math.max((end - start) / MS_PER_HOUR, MIN_DURATION_H);
  let powerKw = s.energyDeliveredKwh / durationH;
  if (s.maxPowerKw && s.maxPowerKw > 0)
    powerKw = Math.min(powerKw, s.maxPowerKw);

  return {
    seriesKey: s.seriesKey,
    start,
    end,
    powerKw,
    revenuePerHour: s.consumedAmountCents / durationH,
  };
}

function peakWithin(blocks: Block[], from: number, to: number) {
  const events: Array<[number, number]> = [];
  for (const b of blocks) {
    events.push([Math.max(b.start, from), b.powerKw]);
    events.push([Math.min(b.end, to), -b.powerKw]);
  }
  // No mesmo instante, processa saídas antes de entradas
  events.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  let current = 0;
  let peak = 0;
  let peakAt = from;
  for (const [time, delta] of events) {
    current += delta;
    if (current > peak + 1e-9) {
      peak = current;
      peakAt = time;
    }
  }
  return { peak, peakAt };
}

export function aggregateEnergy(params: {
  sessions: EnergySessionInput[];
  seriesKeys: string[];
  period: EnergyPeriod;
  tzOffsetMinutes: number;
  now?: Date;
}): EnergyAggregation {
  const now = (params.now ?? new Date()).getTime();
  const { bucketMinutes, buckets } = PERIOD_CONFIG[params.period];
  const bucketMs = bucketMinutes * 60_000;
  const bucketH = bucketMinutes / 60;

  const to =
    alignToBucket(new Date(now), bucketMinutes, params.tzOffsetMinutes) +
    bucketMs;
  const from = to - buckets * bucketMs;

  const validKeys = new Set(params.seriesKeys);
  const blocks = params.sessions
    .filter((s) => validKeys.has(s.seriesKey))
    .map((s) => toBlock(s, now))
    .filter((b): b is Block => !!b && b.end > from && b.start < to);

  const points: EnergyPoint[] = [];
  let globalPeak = 0;
  let globalPeakAt: number | null = null;

  for (let i = 0; i < buckets; i++) {
    const bStart = from + i * bucketMs;
    const bEnd = bStart + bucketMs;
    const inBucket = blocks.filter((b) => b.end > bStart && b.start < bEnd);

    const series: Record<string, SeriesPointValue> = {};
    for (const key of params.seriesKeys) {
      series[key] = { energyKwh: 0, avgPowerKw: 0 };
    }

    let energy = 0;
    let revenue = 0;
    for (const b of inBucket) {
      const overlapH =
        (Math.min(b.end, bEnd) - Math.max(b.start, bStart)) / MS_PER_HOUR;
      const e = b.powerKw * overlapH;
      series[b.seriesKey].energyKwh += e;
      energy += e;
      revenue += b.revenuePerHour * overlapH;
    }

    for (const key of params.seriesKeys) {
      const value = series[key];
      value.avgPowerKw = round(value.energyKwh / bucketH);
      value.energyKwh = round(value.energyKwh);
    }

    const { peak, peakAt } = peakWithin(inBucket, bStart, bEnd);
    if (peak > globalPeak) {
      globalPeak = peak;
      globalPeakAt = peakAt;
    }

    points.push({
      start: new Date(bStart).toISOString(),
      end: new Date(bEnd).toISOString(),
      series,
      totalEnergyKwh: round(energy),
      avgPowerKw: round(energy / bucketH),
      peakPowerKw: round(peak),
      revenueCents: Math.round(revenue),
      sessions: inBucket.length,
    });
  }

  const totalEnergy = points.reduce((sum, p) => sum + p.totalEnergyKwh, 0);
  // Horas efetivamente decorridas (o último intervalo ainda está em andamento)
  const elapsedH = Math.max((Math.min(now, to) - from) / MS_PER_HOUR, bucketH);

  return {
    from: new Date(from).toISOString(),
    to: new Date(to).toISOString(),
    bucketMinutes,
    points,
    totals: {
      energyKwh: round(totalEnergy),
      revenueCents: points.reduce((sum, p) => sum + p.revenueCents, 0),
      sessions: blocks.length,
      avgPowerKw: round(totalEnergy / elapsedH),
      peakPowerKw: round(globalPeak),
      peakAt:
        globalPeakAt != null ? new Date(globalPeakAt).toISOString() : null,
    },
  };
}
