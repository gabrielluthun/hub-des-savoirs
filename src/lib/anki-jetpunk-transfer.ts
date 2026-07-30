import { createAnkiCard } from '@/features/anki/lib/srs/card-factory';
import {
  DEFAULT_ANKI_DECK,
  deckPathSegments,
  joinDeckPath,
  normalizeDeckName,
} from '@/features/anki/lib/decks';
import { buildJetpunkList } from '@/features/jetpunk/lib/build-list';
import {
  toJetpunkExportList,
  type JetpunkExportItem,
  type JetpunkExportList,
} from '@/lib/jetpunk-format';
import type { AnkiCard, JetPunkList } from '@/types';

/**
 * Hub JSON mapping:
 * - JetPunk item.prompt  ↔  Anki card.question
 * - JetPunk item.answer  ↔  Anki card.answer
 * - JetPunk list.title   ↔  Anki deck leaf (after ::)
 * - JetPunk list.category ↔ Anki deck parent path (before ::)
 *
 * Ex. category « Géographie » + title « Capitales du monde »
 *  → deck Anki « Géographie::Capitales du monde »
 */

const GENERIC_CATEGORIES = new Set(['général', 'general', 'anki', '']);

export function splitDeckThemeAndTitle(deck: string): {
  category: string;
  title: string;
} {
  const segments = deckPathSegments(deck);
  if (segments.length === 0) {
    return { category: 'Général', title: DEFAULT_ANKI_DECK };
  }
  if (segments.length === 1) {
    return { category: 'Général', title: segments[0]! };
  }
  return {
    category: joinDeckPath(segments.slice(0, -1)),
    title: segments[segments.length - 1]!,
  };
}

export function joinThemeAndTitle(category: string, title: string): string {
  const leaf = title.trim() || DEFAULT_ANKI_DECK;
  const theme = category.trim();
  if (!theme || GENERIC_CATEGORIES.has(theme.toLowerCase())) {
    return normalizeDeckName(leaf);
  }
  return joinDeckPath([...deckPathSegments(theme), leaf]);
}

function dominantDeck(cards: AnkiCard[]): string {
  const counts = new Map<string, number>();
  for (const card of cards) {
    const deck = normalizeDeckName(card.deck);
    if (!deck) continue;
    counts.set(deck, (counts.get(deck) ?? 0) + 1);
  }
  let best = '';
  let bestCount = 0;
  for (const [deck, count] of counts) {
    if (count > bestCount) {
      best = deck;
      bestCount = count;
    }
  }
  return best;
}

export function ankiCardsToJetpunkExport(
  cards: AnkiCard[],
  options?: { deck?: string; durationSec?: number }
): JetpunkExportList | null {
  const items: JetpunkExportItem[] = [];
  for (const card of cards) {
    const answer = card.answer.trim();
    if (!answer) continue;
    items.push({
      prompt: card.question.trim(),
      answer,
    });
  }
  if (items.length === 0) return null;

  // Prefer the concrete deck of the cards (e.g. Géographie::Capitales),
  // not a parent filter alone (e.g. Géographie).
  const sourceDeck =
    dominantDeck(cards) ||
    normalizeDeckName(options?.deck ?? '') ||
    DEFAULT_ANKI_DECK;
  const { category, title } = splitDeckThemeAndTitle(sourceDeck);

  return {
    title,
    category,
    durationSec:
      options?.durationSec && options.durationSec > 0 ? options.durationSec : 90,
    items,
  };
}

export function ankiCardsToJetpunkList(
  cards: AnkiCard[],
  options?: { deck?: string; durationSec?: number }
): JetPunkList | null {
  const exported = ankiCardsToJetpunkExport(cards, options);
  return exported ? buildJetpunkList(exported) : null;
}

export function jetpunkExportToAnkiCards(list: JetpunkExportList): AnkiCard[] {
  const deck = joinThemeAndTitle(list.category, list.title);

  return list.items
    .filter((item) => item.answer.trim())
    .map((item) =>
      createAnkiCard({
        question: item.prompt.trim() || item.answer.trim(),
        answer: item.answer.trim(),
        deck,
        tags: [],
      })
    );
}

export function jetpunkListToAnkiCards(list: JetPunkList): AnkiCard[] {
  return jetpunkExportToAnkiCards(toJetpunkExportList(list));
}