import { useMemo, useState } from 'react';
import {
  collectCardTags,
  collectDecks,
  countCardsInDeck,
  filterCards,
} from '@/features/anki/lib/organization';
import { normalizeTag } from '@/features/anki/lib/tags';
import type { AnkiCard } from '@/types';

export function useAnkiFilters(cards: AnkiCard[], registeredDecks: string[] = []) {
  const [query, setQuery] = useState('');
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const decks = useMemo(
    () => collectDecks(cards, registeredDecks),
    [cards, registeredDecks]
  );
  const allTags = useMemo(() => collectCardTags(cards), [cards]);
  const deckCounts = useMemo(() => {
    const paths = new Set<string>(decks);
    for (const deck of decks) {
      const parts = deck.split('::');
      for (let i = 1; i < parts.length; i++) {
        paths.add(parts.slice(0, i).join('::'));
      }
    }
    const counts: Record<string, number> = {};
    for (const path of paths) {
      counts[path] = countCardsInDeck(cards, path);
    }
    return counts;
  }, [cards, decks]);

  const scopedCards = useMemo(
    () => filterCards(cards, { deck: selectedDeck, tags: selectedTags, query }),
    [cards, selectedDeck, selectedTags, query]
  );

  const reviewScope = useMemo(
    () => filterCards(cards, { deck: selectedDeck, tags: selectedTags }),
    [cards, selectedDeck, selectedTags]
  );

  const toggleTag = (tag: string) => {
    const normalized = normalizeTag(tag);
    setSelectedTags((current) =>
      current.includes(normalized)
        ? current.filter((t) => t !== normalized)
        : [...current, normalized]
    );
  };

  const clearTags = () => setSelectedTags([]);

  return {
    query,
    setQuery,
    selectedDeck,
    setSelectedDeck,
    selectedTags,
    toggleTag,
    clearTags,
    decks,
    allTags,
    deckCounts,
    scopedCards,
    reviewScope,
  };
}
