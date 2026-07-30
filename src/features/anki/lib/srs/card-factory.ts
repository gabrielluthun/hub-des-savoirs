import { createDefaultSrsFields } from '@/features/anki/lib/srs/schedule';
import type { AnkiCard } from '@/types';
import { createId } from '@/lib/utils';

export function createAnkiCard(input: {
  question: string;
  answer: string;
  id?: string;
}): AnkiCard {
  return {
    id: input.id ?? createId(),
    question: input.question,
    answer: input.answer,
    ...createDefaultSrsFields(),
  };
}

export function withDefaultSrs(card: AnkiCard): AnkiCard {
  const defaults = createDefaultSrsFields();
  return {
    ...card,
    dueAt: card.dueAt ?? defaults.dueAt,
    intervalDays: card.intervalDays ?? defaults.intervalDays,
    reps: card.reps ?? defaults.reps,
  };
}
