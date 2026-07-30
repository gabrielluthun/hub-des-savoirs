import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTagLabel } from '@/features/docs/lib/tags';
import type { HubDocument } from '@/types';

interface DocumentListItemProps {
  doc: HubDocument;
  active: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function DocumentListItem({
  doc,
  active,
  onSelect,
  onDelete,
}: DocumentListItemProps) {
  const tags = doc.tags ?? [];

  return (
    <div
      className={cn(
        'group flex min-w-[160px] items-start gap-0.5 rounded-xl py-0.5 pl-3 pr-1 transition-colors md:min-w-0 md:w-full',
        active ? 'bg-secondary' : 'hover:bg-secondary/50'
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(doc.id)}
        className="min-w-0 flex-1 py-2 pr-1 text-left"
      >
        <p className="truncate text-sm font-medium">{doc.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {doc.googleDocsUrl ? 'Lien Google Docs' : 'Notes locales'}
        </p>
        {tags.length > 0 ? (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded bg-background/80 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground"
              >
                {formatTagLabel(tag)}
              </span>
            ))}
            {tags.length > 3 ? (
              <span className="text-[9px] text-muted-foreground">+{tags.length - 3}</span>
            ) : null}
          </div>
        ) : null}
      </button>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onDelete(doc.id);
        }}
        className="mt-1.5 shrink-0 rounded-lg p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"
        aria-label={`Supprimer ${doc.title}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
