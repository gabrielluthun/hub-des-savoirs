import type { JetPunkHistoryEntry, JetPunkItem } from '@/types';

export type ItemMissStat = {
  itemId: string;
  prompt: string;
  answer: string;
  attempts: number;
  misses: number;
  /** 0–1 */
  missRate: number;
};

/** Aggregate miss rates from history entries that recorded foundIds. */
export function computeItemMissStats(
  items: JetPunkItem[],
  history: JetPunkHistoryEntry[]
): ItemMissStat[] {
  const tracked = history.filter((entry) => Array.isArray(entry.foundIds));
  if (tracked.length === 0) return [];

  const playable = items.filter((item) => item.answer.trim());
  const stats: ItemMissStat[] = [];

  for (const item of playable) {
    let attempts = 0;
    let misses = 0;
    for (const entry of tracked) {
      attempts += 1;
      if (!(entry.foundIds ?? []).includes(item.id)) misses += 1;
    }
    if (attempts === 0) continue;
    stats.push({
      itemId: item.id,
      prompt: item.prompt,
      answer: item.answer,
      attempts,
      misses,
      missRate: misses / attempts,
    });
  }

  return stats
    .filter((stat) => stat.misses > 0)
    .sort((a, b) => b.missRate - a.missRate || b.misses - a.misses);
}

export function pickFocusItems(
  items: JetPunkItem[],
  missStats: ItemMissStat[]
): JetPunkItem[] {
  const focusIds = new Set(missStats.map((stat) => stat.itemId));
  return items.filter((item) => focusIds.has(item.id) && item.answer.trim());
}
