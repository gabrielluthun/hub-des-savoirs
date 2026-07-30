import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { DocumentListItem } from '@/features/docs/components/list/DocumentListItem';
import { DocumentTagFilter } from '@/features/docs/components/list/DocumentTagFilter';
import {
  collectAllTags,
  filterDocsByTags,
  normalizeTag,
} from '@/features/docs/lib/tags';
import type { HubDocument } from '@/types';

interface DocumentListProps {
  docs: HubDocument[];
  activeDocId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

export function DocumentList({ docs, activeDocId, onSelect, onAdd }: DocumentListProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const allTags = useMemo(() => collectAllTags(docs), [docs]);
  const visibleDocs = useMemo(
    () => filterDocsByTags(docs, selectedTags),
    [docs, selectedTags]
  );

  const toggleTag = (tag: string) => {
    const normalized = normalizeTag(tag);
    setSelectedTags((current) =>
      current.includes(normalized)
        ? current.filter((t) => t !== normalized)
        : [...current, normalized]
    );
  };

  return (
    <div className="flex h-full w-full shrink-0 flex-col border-b border-border bg-background md:w-[260px] md:border-b-0 md:border-r">
      <div className="flex items-start justify-between px-4 pb-3 pt-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Documents
          </p>
          <h2 className="font-display text-lg font-semibold">Google Docs</h2>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="mt-1 rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="Nouveau document"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <DocumentTagFilter
        allTags={allTags}
        selectedTags={selectedTags}
        onToggle={toggleTag}
        onClear={() => setSelectedTags([])}
      />

      <div className="flex max-h-40 gap-1 overflow-x-auto px-2 pb-3 md:max-h-none md:flex-1 md:flex-col md:space-y-1 md:overflow-y-auto md:pb-4">
        {visibleDocs.length === 0 ? (
          <p className="px-2 py-3 text-xs text-muted-foreground">
            Aucun document pour ce filtre.
          </p>
        ) : (
          visibleDocs.map((doc) => (
            <DocumentListItem
              key={doc.id}
              doc={doc}
              active={doc.id === activeDocId}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}
