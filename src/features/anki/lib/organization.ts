import { decksEqual, DEFAULT_ANKI_DECK, normalizeDeckName } from '@/features/anki/lib/decks';
import { dedupeTags, normalizeTag } from '@/features/anki/lib/tags';
import type { AnkiCard } from '@/types';

export function collectDecks(cards: AnkiCard[]): string[] {
  const byKey = new Map<string, string>();
  for (const card of cards) {
    const name = normalizeDeckName(card.deck ?? DEFAULT_ANKI_DECK);
    const key = name.toLowerCase();
    if (!byKey.has(key)) byKey.set(key, name);
  }
  if (!byKey.has(DEFAULT_ANKI_DECK.toLowerCase())) {
    byKey.set(DEFAULT_ANKI_DECK.toLowerCase(), DEFAULT_ANKI_DECK);
  }
  return [...byKey.values()].sort((a, b) => a.localeCompare(b, 'fr'));
}

export function collectCardTags(cards: AnkiCard[]): string[] {
  return dedupeTags(cards.flatMap((card) => card.tags ?? []));
}

export function filterCardsByDeck(
  cards: AnkiCard[],
  deck: string | null
): AnkiCard[] {
  if (!deck) return cards;
  return cards.filter((card) => decksEqual(card.deck ?? DEFAULT_ANKI_DECK, deck));
}

/** OR filter: empty selection = all cards. */
export function filterCardsByTags(
  cards: AnkiCard[],
  selectedTags: string[]
): AnkiCard[] {
  if (selectedTags.length === 0) return cards;
  const selected = new Set(selectedTags.map(normalizeTag));
  return cards.filter((card) =>
    (card.tags ?? []).some((tag) => selected.has(normalizeTag(tag)))
  );
}

export function filterCards(
  cards: AnkiCard[],
  options: { deck: string | null; tags: string[]; query?: string }
): AnkiCard[] {
  let result = filterCardsByDeck(cards, options.deck);
  result = filterCardsByTags(result, options.tags);
  const q = options.query?.trim().toLowerCase();
  if (!q) return result;
  return result.filter(
    (card) =>
      card.question.toLowerCase().includes(q) ||
      card.answer.toLowerCase().includes(q) ||
      (card.deck ?? '').toLowerCase().includes(q) ||
      (card.tags ?? []).some((tag) => tag.includes(q))
  );
}

export function countCardsInDeck(cards: AnkiCard[], deck: string): number {
  return filterCardsByDeck(cards, deck).length;
}
