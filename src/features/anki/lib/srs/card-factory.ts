import { DEFAULT_ANKI_DECK, normalizeDeckName } from '@/features/anki/lib/decks';
import { createDefaultSrsFields } from '@/features/anki/lib/srs/schedule';
import { dedupeTags } from '@/features/anki/lib/tags';
import type { AnkiCard } from '@/types';
import { createId } from '@/lib/utils';

export function createAnkiCard(input: {
  question: string;
  answer: string;
  mnemonic?: string;
  deck: string;
  tags?: string[];
  id?: string;
}): AnkiCard {
  return {
    id: input.id ?? createId(),
    question: input.question,
    answer: input.answer,
    mnemonic: input.mnemonic?.trim() ?? '',
    deck: normalizeDeckName(input.deck),
    tags: dedupeTags(input.tags ?? []),
    ...createDefaultSrsFields(),
  };
}

export function withDefaultSrs(card: AnkiCard): AnkiCard {
  const defaults = createDefaultSrsFields();
  return {
    ...card,
    mnemonic: card.mnemonic ?? '',
    deck: normalizeDeckName(card.deck ?? '') || DEFAULT_ANKI_DECK,
    tags: Array.isArray(card.tags) ? dedupeTags(card.tags) : [],
    dueAt: card.dueAt ?? defaults.dueAt,
    intervalDays: card.intervalDays ?? defaults.intervalDays,
    reps: card.reps ?? defaults.reps,
  };
}
