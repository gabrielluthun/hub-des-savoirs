import { cn } from '@/lib/utils';
import type { JetPunkList } from '@/types';
import { Plus } from 'lucide-react';

interface ListSidebarProps {
  lists: JetPunkList[];
  activeListId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

export function ListSidebar({ lists, activeListId, onSelect, onAdd }: ListSidebarProps) {
  return (
    <div className="flex h-full w-full shrink-0 flex-col border-b border-border bg-background md:w-[260px] md:border-b-0 md:border-r">
      <div className="flex items-start justify-between px-4 pb-3 pt-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Listes
          </p>
          <h2 className="font-display text-lg font-semibold">JetPunk</h2>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="mt-1 rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="Nouvelle liste"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex max-h-40 gap-1 overflow-x-auto px-2 pb-3 md:max-h-none md:flex-1 md:flex-col md:space-y-1 md:overflow-y-auto md:pb-4">
        {lists.map((list) => {
          const active = list.id === activeListId;
          return (
            <button
              key={list.id}
              type="button"
              onClick={() => onSelect(list.id)}
              className={cn(
                'min-w-[160px] rounded-xl px-3 py-2.5 text-left transition-colors md:min-w-0 md:w-full',
                active ? 'bg-secondary' : 'hover:bg-secondary/50'
              )}
            >
              <p className="truncate text-sm font-medium">{list.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {list.category} • {list.items.length} items
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
