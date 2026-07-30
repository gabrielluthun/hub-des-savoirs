import { useCallback, useMemo, useState } from 'react';
import {
  applySrsGrade,
  getDueCards,
  getShuffledDueCards,
} from '@/features/anki/lib/srs/schedule';
import type { SrsGrade } from '@/features/anki/lib/srs/grades';
import type { AnkiCard } from '@/types';

export function useReviewQueue(
  cards: AnkiCard[],
  onGrade: (cardId: string, patch: Pick<AnkiCard, 'dueAt' | 'intervalDays' | 'reps'>) => void
) {
  const dueCards = useMemo(() => getDueCards(cards), [cards]);
  const [queueIds, setQueueIds] = useState<string[] | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  const active = queueIds !== null;
  const queue = useMemo(() => {
    if (!queueIds) return [];
    const byId = new Map(cards.map((card) => [card.id, card]));
    return queueIds
      .map((id) => byId.get(id))
      .filter((card): card is AnkiCard => Boolean(card));
  }, [cards, queueIds]);

  const current = queue[0] ?? null;
  const remaining = queue.length;

  const start = useCallback(() => {
    const due = getShuffledDueCards(cards);
    setQueueIds(due.map((card) => card.id));
    setRevealed(false);
    setReviewedCount(0);
  }, [cards]);

  const stop = useCallback(() => {
    setQueueIds(null);
    setRevealed(false);
    setReviewedCount(0);
  }, []);

  const reveal = useCallback(() => setRevealed(true), []);

  const grade = useCallback(
    (value: SrsGrade) => {
      if (!current || !revealed) return;
      const patch = applySrsGrade(current, value);
      onGrade(current.id, patch);
      setReviewedCount((count) => count + 1);
      setRevealed(false);
      setQueueIds((ids) => {
        if (!ids) return ids;
        const [, ...rest] = ids;
        if (value === 'again') {
          return [...rest, current.id];
        }
        return rest;
      });
    },
    [current, onGrade, revealed]
  );

  return {
    active,
    dueCount: dueCards.length,
    current,
    remaining,
    reviewedCount,
    revealed,
    start,
    stop,
    reveal,
    grade,
  };
}
