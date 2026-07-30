import { decksEqual, mergeDeckNames, normalizeDeckName } from '@/features/anki/lib/decks';
import { dedupeTags, normalizeTag } from '@/features/anki/lib/tags';
import type { AnkiCard } from '@/types';

export function collectDecks(cards: AnkiCard[], registered: string[] = []): string[] {
  return mergeDeckNames(
    registered,
    cards.map((card) => card.deck ?? '')
  );
}

export function collectCardTags(cards: AnkiCard[]): string[] {
  return dedupeTags(cards.flatMap((card) => card.tags ?? []));
}

export function filterCardsByDeck(
  cards: AnkiCard[],
  deck: string | null
): AnkiCard[] {
  if (!deck) return cards;
  return cards.filter((card) => decksEqual(card.deck ?? '', deck));
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
      (card.mnemonic ?? '').toLowerCase().includes(q) ||
      (card.deck ?? '').toLowerCase().includes(q) ||
      (card.tags ?? []).some((tag) => tag.includes(q))
  );
}

export function countCardsInDeck(cards: AnkiCard[], deck: string): number {
  return filterCardsByDeck(cards, deck).length;
}

export function deckExists(decks: string[], name: string): boolean {
  const normalized = normalizeDeckName(name);
  return decks.some((deck) => decksEqual(deck, normalized));
}
