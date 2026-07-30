import { useEffect, useMemo, useState } from 'react';
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
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const list of lists) {
      const category = list.category.trim() || 'Général';
      set.add(category);
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'fr'));
  }, [lists]);

  useEffect(() => {
    if (categoryFilter !== 'all' && !categories.includes(categoryFilter)) {
      setCategoryFilter('all');
    }
  }, [categories, categoryFilter]);

  const visibleLists = useMemo(() => {
    if (categoryFilter === 'all') return lists;
    return lists.filter(
      (list) => (list.category.trim() || 'Général') === categoryFilter
    );
  }, [lists, categoryFilter]);

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

      {categories.length > 1 ? (
        <div className="flex gap-1.5 overflow-x-auto px-3 pb-3">
          <FilterChip
            label="Toutes"
            active={categoryFilter === 'all'}
            onClick={() => setCategoryFilter('all')}
          />
          {categories.map((category) => (
            <FilterChip
              key={category}
              label={category}
              active={categoryFilter === category}
              onClick={() => setCategoryFilter(category)}
            />
          ))}
        </div>
      ) : null}

      <div className="flex max-h-40 gap-1 overflow-x-auto px-2 pb-3 md:max-h-none md:flex-1 md:flex-col md:space-y-1 md:overflow-y-auto md:pb-4">
        {visibleLists.length === 0 ? (
          <p className="px-3 py-2 text-xs text-muted-foreground">
            Aucune liste dans cette catégorie.
          </p>
        ) : (
          visibleLists.map((list) => {
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
          })
        )}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-muted-foreground hover:text-foreground'
      )}
    >
      {label}
    </button>
  );
}
