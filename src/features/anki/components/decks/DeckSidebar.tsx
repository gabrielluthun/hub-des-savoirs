import { useMemo, useState } from 'react';
import { DeckCreateForm } from '@/features/anki/components/decks/DeckCreateForm';
import { DeckListItem } from '@/features/anki/components/decks/DeckListItem';
import { DeckTagFilter } from '@/features/anki/components/decks/DeckTagFilter';
import { DeckTreeRows } from '@/features/anki/components/decks/DeckTreeRows';
import { useDeckTreeExpand } from '@/features/anki/hooks/useDeckTreeExpand';
import { buildDeckTree } from '@/features/anki/lib/decks';
import { Input } from '@/components/ui/primitives';

interface DeckSidebarProps {
  decks: string[];
  deckCounts: Record<string, number>;
  selectedDeck: string | null;
  onSelectDeck: (deck: string | null) => void;
  onCreateDeck: (name: string) => boolean;
  onDeleteDeck: (name: string) => void;
  allTags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearTags: () => void;
  totalCount: number;
}

export function DeckSidebar({
  decks,
  deckCounts,
  selectedDeck,
  onSelectDeck,
  onCreateDeck,
  onDeleteDeck,
  allTags,
  selectedTags,
  onToggleTag,
  onClearTags,
  totalCount,
}: DeckSidebarProps) {
  const [deckQuery, setDeckQuery] = useState('');
  const { expanded, toggleExpand } = useDeckTreeExpand(decks, selectedDeck);

  const filteredDecks = useMemo(() => {
    const q = deckQuery.trim().toLowerCase();
    if (!q) return decks;
    return decks.filter((deck) => deck.toLowerCase().includes(q));
  }, [decks, deckQuery]);

  const tree = useMemo(() => buildDeckTree(filteredDecks), [filteredDecks]);

  return (
    <aside className="flex h-full min-h-0 w-full shrink-0 flex-col border-b border-border bg-background md:w-[220px] md:border-b-0 md:border-r">
      <div className="shrink-0 px-4 pb-2 pt-5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Organisation
        </p>
        <h2 className="font-display text-lg font-semibold">Decks Anki</h2>
        <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
          Sous-deck : Parent::Enfant
        </p>
      </div>

      {decks.length > 6 ? (
        <div className="shrink-0 px-2 pb-2">
          <Input
            value={deckQuery}
            onChange={(e) => setDeckQuery(e.target.value)}
            placeholder="Filtrer les decks…"
            className="h-8 text-xs"
            aria-label="Filtrer les decks"
          />
        </div>
      ) : null}

      <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 pb-2">
        <DeckListItem
          name="Tous les decks"
          count={totalCount}
          active={selectedDeck === null}
          onSelect={() => onSelectDeck(null)}
        />
        <DeckTreeRows
          nodes={tree}
          depth={0}
          deckCounts={deckCounts}
          selectedDeck={selectedDeck}
          expanded={expanded}
          onToggleExpand={toggleExpand}
          onSelectDeck={onSelectDeck}
          onDeleteDeck={onDeleteDeck}
        />
        {deckQuery.trim() && tree.length === 0 ? (
          <p className="px-3 py-2 text-[10px] text-muted-foreground">Aucun deck trouvé.</p>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-border px-2 py-2">
        <DeckCreateForm onCreate={onCreateDeck} parentHint={selectedDeck} />
      </div>

      <DeckTagFilter
        tags={allTags}
        selectedTags={selectedTags}
        onToggleTag={onToggleTag}
        onClearTags={onClearTags}
      />
    </aside>
  );
}
