import { extractOutline } from '@/lib/markdown';

interface OutlinePanelProps {
  content: string;
}

export function OutlinePanel({ content }: OutlinePanelProps) {
  const outline = extractOutline(content);

  return (
    <aside className="hidden w-[200px] shrink-0 border-l border-border bg-background p-4 lg:block">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Plan
      </p>
      {outline.length === 0 ? (
        <p className="text-xs leading-relaxed text-muted-foreground">
          Utilisez #, ##, ### pour structurer le plan.
        </p>
      ) : (
        <ul className="space-y-2">
          {outline.map((item) => (
            <li
              key={`${item.line}-${item.text}`}
              className="truncate text-xs text-muted-foreground"
              style={{ paddingLeft: `${(item.level - 1) * 10}px` }}
            >
              {item.text}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
