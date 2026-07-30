import { useEffect, useMemo, useState } from 'react';
import { Select } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';
import type { JetPunkList } from '@/types';
import { Download, Plus, Trash2 } from 'lucide-react';

interface ListSidebarProps {
  lists: JetPunkList[];
  activeListId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onExportAll: () => void;
}

export function ListSidebar({
  lists,
  activeListId,
  onSelect,
  onAdd,
  onDelete,
  onExportAll,
}: ListSidebarProps) {
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
        <div className="mt-1 flex items-center gap-0.5">
          <button
            type="button"
            onClick={onExportAll}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Exporter toutes les listes"
            title="Exporter toutes les listes"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onAdd}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Nouvelle liste"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {categories.length > 1 ? (
        <div className="px-3 pb-3">
          <Select
            aria-label="Filtrer par catégorie"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-8 text-xs"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
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
              <div
                key={list.id}
                className={cn(
                  'group flex min-w-[160px] items-center gap-0.5 rounded-xl py-0.5 pl-3 pr-1 transition-colors md:min-w-0 md:w-full',
                  active ? 'bg-secondary' : 'hover:bg-secondary/50'
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelect(list.id)}
                  className="min-w-0 flex-1 py-2 pr-1 text-left"
                >
                  <p className="truncate text-sm font-medium">{list.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {list.category} • {list.items.length} items
                  </p>
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(list.id);
                  }}
                  className="shrink-0 rounded-lg p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"
                  aria-label={`Supprimer ${list.title}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
