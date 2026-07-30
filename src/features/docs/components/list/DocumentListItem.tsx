import { cn } from '@/lib/utils';
import { formatTagLabel } from '@/features/docs/lib/tags';
import type { HubDocument } from '@/types';

interface DocumentListItemProps {
  doc: HubDocument;
  active: boolean;
  onSelect: (id: string) => void;
}

export function DocumentListItem({ doc, active, onSelect }: DocumentListItemProps) {
  const tags = doc.tags ?? [];

  return (
    <button
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
  );
}
