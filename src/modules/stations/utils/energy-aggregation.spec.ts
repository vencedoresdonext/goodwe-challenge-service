import { describe, it, expect } from 'vitest';
import { aggregateEnergy, alignToBucket } from './energy-aggregation';

const BRT = 180; // UTC-3
const at = (iso: string) => new Date(iso);

describe('energy-aggregation', () => {
  describe('alignToBucket', () => {
    it('aligns daily buckets to local midnight (BRT)', () => {
      // 10:00 local (13:00Z) -> 00:00 local = 03:00Z
      const start = alignToBucket(at('2026-09-25T13:00:00Z'), 1440, BRT);
      expect(new Date(start).toISOString()).toBe('2026-09-25T03:00:00.000Z');
    });
  });

  describe('aggregateEnergy', () => {
    const now = at('2026-09-25T15:30:00Z'); // 12:30 BRT

    it('spreads the session energy across hourly buckets as average kW', () => {
      const result = aggregateEnergy({
        period: '24h',
        tzOffsetMinutes: BRT,
        now,
        seriesKeys: ['s1'],
        sessions: [
          {
            seriesKey: 's1',
            statusId: 4,
            energyDeliveredKwh: 22, // 2h a 11 kW
            consumedAmountCents: 2000,
            maxPowerKw: 22,
            startedAt: at('2026-09-25T12:30:00Z'),
            finishedAt: at('2026-09-25T14:30:00Z'),
          },
        ],
      });

      expect(result.points).toHaveLength(24);
      expect(result.totals.energyKwh).toBeCloseTo(22);
      expect(result.totals.revenueCents).toBe(2000);
      expect(result.totals.peakPowerKw).toBeCloseTo(11);

      const byStart = Object.fromEntries(
        result.points.map((p) => [p.start, p]),
      );
      // 12:00Z–13:00Z: meia hora de sessão -> 5.5 kWh / 1h = 5.5 kW médio
      expect(byStart['2026-09-25T12:00:00.000Z'].avgPowerKw).toBeCloseTo(5.5);
      expect(byStart['2026-09-25T12:00:00.000Z'].peakPowerKw).toBeCloseTo(11);
      // 13:00Z–14:00Z: hora cheia
      expect(
        byStart['2026-09-25T13:00:00.000Z'].series.s1.energyKwh,
      ).toBeCloseTo(11);
    });

    it('sums overlapping sessions into the peak and caps at connector power', () => {
      const result = aggregateEnergy({
        period: '24h',
        tzOffsetMinutes: BRT,
        now,
        seriesKeys: ['a', 'b'],
        sessions: [
          {
            seriesKey: 'a',
            statusId: 4,
            energyDeliveredKwh: 7,
            consumedAmountCents: 0,
            maxPowerKw: 7,
            startedAt: at('2026-09-25T13:00:00Z'),
            finishedAt: at('2026-09-25T14:00:00Z'),
          },
          {
            seriesKey: 'b',
            statusId: 4,
            // 100 kWh em 1h seria 100 kW, mas o conector é de 22 kW
            energyDeliveredKwh: 100,
            consumedAmountCents: 0,
            maxPowerKw: 22,
            startedAt: at('2026-09-25T13:30:00Z'),
            finishedAt: at('2026-09-25T14:30:00Z'),
          },
        ],
      });
      expect(result.totals.peakPowerKw).toBeCloseTo(29);
      expect(result.totals.peakAt).toBe('2026-09-25T13:30:00.000Z');
    });

    it('ignores sessions from unknown series and non-active sessions without end', () => {
      const result = aggregateEnergy({
        period: '7d',
        tzOffsetMinutes: BRT,
        now,
        seriesKeys: ['s1'],
        sessions: [
          {
            seriesKey: 'other',
            statusId: 4,
            energyDeliveredKwh: 10,
            consumedAmountCents: 0,
            maxPowerKw: null,
            startedAt: at('2026-09-25T10:00:00Z'),
            finishedAt: at('2026-09-25T11:00:00Z'),
          },
          {
            seriesKey: 's1',
            statusId: 5, // FAILED, sem fim
            energyDeliveredKwh: 10,
            consumedAmountCents: 0,
            maxPowerKw: null,
            startedAt: at('2026-09-25T10:00:00Z'),
            finishedAt: null,
          },
        ],
      });
      expect(result.points).toHaveLength(56);
      expect(result.totals.energyKwh).toBe(0);
      expect(result.totals.sessions).toBe(0);
      expect(result.totals.peakAt).toBeNull();
    });

    it('uses "now" as the end of an active charging session', () => {
      const result = aggregateEnergy({
        period: '24h',
        tzOffsetMinutes: BRT,
        now,
        seriesKeys: ['s1'],
        sessions: [
          {
            seriesKey: 's1',
            statusId: 3, // CHARGING
            energyDeliveredKwh: 5,
            consumedAmountCents: 0,
            maxPowerKw: 22,
            startedAt: at('2026-09-25T15:00:00Z'),
            finishedAt: null,
          },
        ],
      });
      expect(result.totals.energyKwh).toBeCloseTo(5);
      expect(result.totals.peakPowerKw).toBeCloseTo(10); // 5 kWh em 30 min
    });
  });
});
