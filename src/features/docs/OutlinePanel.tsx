import { extractOutline } from '@/lib/markdown';

interface OutlinePanelProps {
  content: string;
  onNavigate?: (line: number) => void;
}

export function OutlinePanel({ content, onNavigate }: OutlinePanelProps) {
  const outline = extractOutline(content);

  return (
    <aside className="hidden h-full min-h-0 w-[200px] shrink-0 flex-col border-l border-border bg-background lg:flex">
      <p className="shrink-0 px-4 pb-3 pt-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Plan
      </p>
      {outline.length === 0 ? (
        <p className="px-4 text-xs leading-relaxed text-muted-foreground">
          Utilisez #, ##, ### pour structurer le plan.
        </p>
      ) : (
        <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain px-2 pb-4">
          {outline.map((item) => (
            <li key={`${item.line}-${item.text}`}>
              <button
                type="button"
                onClick={() => onNavigate?.(item.line)}
                title={item.text}
                className="w-full truncate rounded-md px-2 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                style={{ paddingLeft: `${8 + (item.level - 1) * 10}px` }}
              >
                {item.text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
