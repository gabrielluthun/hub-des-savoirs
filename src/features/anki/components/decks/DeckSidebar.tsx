import { useMemo, useState } from 'react';
import { DeckCreateForm } from '@/features/anki/components/decks/DeckCreateForm';
import { DeckListItem } from '@/features/anki/components/decks/DeckListItem';
import { formatTagLabel } from '@/features/anki/lib/tags';
import { Input } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';

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
  const selectedTagSet = new Set(selectedTags);

  const filteredDecks = useMemo(() => {
    const q = deckQuery.trim().toLowerCase();
    if (!q) return decks;
    return decks.filter((deck) => deck.toLowerCase().includes(q));
  }, [decks, deckQuery]);

  return (
    <aside className="flex h-full min-h-0 w-full shrink-0 flex-col border-b border-border bg-background md:w-[220px] md:border-b-0 md:border-r">
      <div className="shrink-0 px-4 pb-2 pt-5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Organisation
        </p>
        <h2 className="font-display text-lg font-semibold">Decks</h2>
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

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-2">
        <DeckListItem
          name="Tous les decks"
          count={totalCount}
          active={selectedDeck === null}
          onSelect={() => onSelectDeck(null)}
        />
        {filteredDecks.map((deck) => (
          <DeckListItem
            key={deck}
            name={deck}
            count={deckCounts[deck] ?? 0}
            active={selectedDeck === deck}
            onSelect={() => onSelectDeck(deck)}
            onDelete={() => onDeleteDeck(deck)}
          />
        ))}
        {deckQuery.trim() && filteredDecks.length === 0 ? (
          <p className="px-3 py-2 text-[10px] text-muted-foreground">Aucun deck trouvé.</p>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-border px-2 py-2">
        <DeckCreateForm onCreate={onCreateDeck} />
      </div>

      <div className="max-h-[30%] shrink-0 overflow-y-auto border-t border-border px-3 py-3">
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Tags
          </p>
          {selectedTags.length > 0 ? (
            <button
              type="button"
              onClick={onClearTags}
              className="text-[10px] text-muted-foreground hover:text-foreground"
            >
              Tout
            </button>
          ) : null}
        </div>
        {allTags.length === 0 ? (
          <p className="px-1 text-[10px] text-muted-foreground">Aucun tag.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => {
              const active = selectedTagSet.has(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onToggleTag(tag)}
                  className={cn(
                    'rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  )}
                >
                  {formatTagLabel(tag)}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
