import { useMemo, useState } from 'react';
import {
  collectCardTags,
  collectDecks,
  countCardsInDeck,
  filterCards,
} from '@/features/anki/lib/organization';
import { normalizeTag } from '@/features/anki/lib/tags';
import type { AnkiCard } from '@/types';

export function useAnkiFilters(cards: AnkiCard[]) {
  const [query, setQuery] = useState('');
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const decks = useMemo(() => collectDecks(cards), [cards]);
  const allTags = useMemo(() => collectCardTags(cards), [cards]);
  const deckCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const deck of decks) {
      counts[deck] = countCardsInDeck(cards, deck);
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
