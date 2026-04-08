import type { Proposal } from '../types';

export type Granularity = 'day' | 'week';
export interface Bucket { date: string; count: number }

/**
 * Returns the ISO date string (YYYY-MM-DD) for the Monday of the week
 * containing the given date.
 */
function weekStart(d: Date): string {
  const day = d.getDay(); // 0 = Sun
  const diff = (day === 0 ? -6 : 1 - day); // shift to Monday
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  return monday.toISOString().slice(0, 10);
}

/**
 * Pure aggregation function — groups proposals into time buckets.
 * Satisfies the conservation property: sum(bucket.count) === proposals.length.
 */
export function aggregateTimeSeries(
  proposals: Proposal[],
  granularity: Granularity
): Bucket[] {
  if (proposals.length === 0) return [];

  const counts = new Map<string, number>();

  for (const p of proposals) {
    const d = new Date(p.generatedAt);
    const key = granularity === 'day'
      ? d.toISOString().slice(0, 10)          // YYYY-MM-DD
      : weekStart(d);                          // Monday of that week
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

/**
 * Formats a YYYY-MM-DD bucket key into a human-readable label.
 * day view  → "Mon 12"
 * week view → "Jan 6"
 */
export function formatBucketLabel(date: string, granularity: Granularity): string {
  const d = new Date(date + 'T00:00:00');
  if (granularity === 'day') {
    return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
