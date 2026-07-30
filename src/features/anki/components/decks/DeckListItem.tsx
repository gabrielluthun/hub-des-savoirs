import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeckListItemProps {
  name: string;
  count: number;
  active: boolean;
  onSelect: () => void;
  onDelete?: () => void;
}

export function DeckListItem({
  name,
  count,
  active,
  onSelect,
  onDelete,
}: DeckListItemProps) {
  return (
    <div
      className={cn(
        'group flex w-full items-center gap-1 rounded-xl pr-1 text-sm transition-colors',
        active ? 'bg-secondary' : 'hover:bg-secondary/50'
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center justify-between px-3 py-2 text-left"
      >
        <span className="truncate font-medium">{name}</span>
        <span className="tabular-nums text-xs text-muted-foreground">{count}</span>
      </button>
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
  );
}
