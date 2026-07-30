import { cn } from '@/lib/utils';
import { formatTagLabel } from '@/features/docs/lib/tags';

interface DocumentTagFilterProps {
  allTags: string[];
  selectedTags: string[];
  onToggle: (tag: string) => void;
  onClear: () => void;
}

export function DocumentTagFilter({
  allTags,
  selectedTags,
  onToggle,
  onClear,
}: DocumentTagFilterProps) {
  if (allTags.length === 0) {
    return (
      <p className="px-4 pb-2 text-[10px] text-muted-foreground">
        Aucun tag pour le moment.
      </p>
    );
  }

  const selected = new Set(selectedTags);

  return (
    <div className="space-y-2 border-b border-border px-3 pb-3">
      <div className="flex items-center justify-between gap-2 px-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Filtrer par tags
        </p>
        {selectedTags.length > 0 ? (
          <button
            type="button"
            onClick={onClear}
            className="text-[10px] text-muted-foreground hover:text-foreground"
          >
            Tout
          </button>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {allTags.map((tag) => {
          const active = selected.has(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onToggle(tag)}
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
    </div>
  );
}
