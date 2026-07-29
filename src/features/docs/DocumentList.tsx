import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HubDocument } from '@/types';

interface DocumentListProps {
  docs: HubDocument[];
  activeDocId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

export function DocumentList({ docs, activeDocId, onSelect, onAdd }: DocumentListProps) {
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

      <div className="flex max-h-40 gap-1 overflow-x-auto px-2 pb-3 md:max-h-none md:flex-1 md:flex-col md:space-y-1 md:overflow-y-auto md:pb-4">
        {docs.map((doc) => {
          const active = doc.id === activeDocId;
          return (
            <button
              key={doc.id}
              type="button"
              onClick={() => onSelect(doc.id)}
              className={cn(
                'min-w-[160px] rounded-xl px-3 py-2.5 text-left transition-colors md:min-w-0 md:w-full',
                active ? 'bg-secondary' : 'hover:bg-secondary/50'
              )}
            >
              <p className="truncate text-sm font-medium">{doc.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {doc.googleDocsUrl ? 'Lien Google Docs' : 'Notes locales'}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
