import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeckListItemProps {
  name: string;
  count: number;
  active: boolean;
  depth?: number;
  expandable?: boolean;
  expanded?: boolean;
  onToggleExpand?: () => void;
  onSelect: () => void;
  onDelete?: () => void;
}

export function DeckListItem({
  name,
  count,
  active,
  depth = 0,
  expandable = false,
  expanded = false,
  onToggleExpand,
  onSelect,
  onDelete,
}: DeckListItemProps) {
  return (
    <div
      className={cn(
        'group flex w-full items-center gap-0.5 rounded-xl py-0.5 pl-2 pr-1 text-sm transition-colors',
        active ? 'bg-secondary' : 'hover:bg-secondary/50'
      )}
      style={{ marginLeft: Math.min(depth, 4) * 10 }}
    >
      {expandable ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleExpand?.();
          }}
          className="rounded-md p-1 text-muted-foreground hover:text-foreground"
          aria-label={expanded ? 'Replier' : 'Déplier'}
          aria-expanded={expanded}
        >
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </button>
      ) : (
        <span className="inline-block w-6 shrink-0" aria-hidden />
      )}
      <button
        type="button"
        onClick={onSelect}
        className="min-w-0 flex-1 truncate py-2 pr-2 text-left font-medium"
        title={name}
      >
        {name}
      </button>
      <span className="w-6 shrink-0 text-right tabular-nums text-xs text-muted-foreground">
        {count}
      </span>
      <div className="flex w-7 shrink-0 justify-center">
        {onDelete ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"
            aria-label={`Supprimer le deck ${name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
