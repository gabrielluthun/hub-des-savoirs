import type { AnkiCard } from '@/types';
import type { SrsGrade } from '@/features/anki/lib/srs/grades';

const AGAIN_DELAY_MS = 10 * 60 * 1000;

export function createDefaultSrsFields(now = new Date()): Pick<
  AnkiCard,
  'dueAt' | 'intervalDays' | 'reps'
> {
  return {
    dueAt: now.toISOString(),
    intervalDays: 0,
    reps: 0,
  };
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function isCardDue(card: AnkiCard, now = new Date()): boolean {
  const dueAt = card.dueAt ? new Date(card.dueAt) : new Date(0);
  return dueAt.getTime() <= now.getTime();
}

export function getDueCards(cards: AnkiCard[], now = new Date()): AnkiCard[] {
  return cards
    .filter((card) => isCardDue(card, now))
    .sort((a, b) => {
      const aTime = a.dueAt ? new Date(a.dueAt).getTime() : 0;
      const bTime = b.dueAt ? new Date(b.dueAt).getTime() : 0;
      return aTime - bTime;
    });
}

export function applySrsGrade(
  card: AnkiCard,
  grade: SrsGrade,
  now = new Date()
): Pick<AnkiCard, 'dueAt' | 'intervalDays' | 'reps'> {
  const interval = card.intervalDays ?? 0;
  const reps = card.reps ?? 0;

  if (grade === 'again') {
    return {
      dueAt: new Date(now.getTime() + AGAIN_DELAY_MS).toISOString(),
      intervalDays: 0,
      reps,
    };
  }

  const nextInterval =
    grade === 'ok'
      ? interval <= 0
        ? 1
        : Math.max(1, Math.round(interval * 2))
      : interval <= 0
        ? 3
        : Math.max(3, Math.round(interval * 3));

  return {
    dueAt: addDays(now, nextInterval).toISOString(),
    intervalDays: nextInterval,
    reps: reps + 1,
  };
}

export function formatIntervalHint(grade: SrsGrade, card: AnkiCard): string {
  if (grade === 'again') return '10 min';
  const interval = card.intervalDays ?? 0;
  if (grade === 'ok') {
    const days = interval <= 0 ? 1 : Math.max(1, Math.round(interval * 2));
    return days === 1 ? '1 j' : `${days} j`;
  }
  const days = interval <= 0 ? 3 : Math.max(3, Math.round(interval * 3));
  return `${days} j`;
}
