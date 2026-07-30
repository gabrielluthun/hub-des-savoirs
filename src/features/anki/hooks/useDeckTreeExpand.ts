import { useEffect, useState } from 'react';
import { DECK_PATH_SEP, deckIsUnder } from '@/features/anki/lib/decks';

/** Keeps ancestors of the selected deck expanded in the sidebar tree. */
export function useDeckTreeExpand(decks: string[], selectedDeck: string | null) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!selectedDeck) return;
    setExpanded((current) => {
      const next = { ...current };
      let changed = false;

      for (const deck of decks) {
        if (
          deckIsUnder(selectedDeck, deck) &&
          selectedDeck.toLowerCase() !== deck.toLowerCase() &&
          next[deck] === false
        ) {
          next[deck] = true;
          changed = true;
        }
      }

      const parts = selectedDeck.split(DECK_PATH_SEP);
      for (let i = 1; i < parts.length; i++) {
        const ancestor = parts.slice(0, i).join(DECK_PATH_SEP);
        if (next[ancestor] === false) {
          next[ancestor] = true;
          changed = true;
        }
      }

      return changed ? next : current;
    });
  }, [selectedDeck, decks]);

  const toggleExpand = (path: string) => {
    setExpanded((current) => ({
      ...current,
      [path]: !(current[path] ?? true),
    }));
  };

  return { expanded, toggleExpand };
}
