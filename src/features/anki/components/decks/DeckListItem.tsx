import { cn } from '@/lib/utils';

interface DeckListItemProps {
  name: string;
  count: number;
  active: boolean;
  onSelect: () => void;
}

export function DeckListItem({ name, count, active, onSelect }: DeckListItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors',
        active ? 'bg-secondary' : 'hover:bg-secondary/50'
      )}
    >
      <span className="truncate font-medium">{name}</span>
      <span className="tabular-nums text-xs text-muted-foreground">{count}</span>
    </button>
  );
}
