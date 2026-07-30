import { formatTagLabel } from '@/features/anki/lib/tags';
import { cn } from '@/lib/utils';

interface DeckTagFilterProps {
  tags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearTags: () => void;
}

export function DeckTagFilter({
  tags,
  selectedTags,
  onToggleTag,
  onClearTags,
}: DeckTagFilterProps) {
  const selected = new Set(selectedTags);

  return (
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
      {tags.length === 0 ? (
        <p className="px-1 text-[10px] text-muted-foreground">Aucun tag.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => {
            const active = selected.has(tag);
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
  );
}
