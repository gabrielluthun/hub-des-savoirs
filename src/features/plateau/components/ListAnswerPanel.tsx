import { Button, Input } from '@/components/ui/primitives';

interface ListAnswerPanelProps {
  items: string[];
  foundItems: string[];
  revealed: boolean;
  typed: string;
  onTypedChange: (value: string) => void;
  onSubmit: () => void;
}

export function ListAnswerPanel({
  items,
  foundItems,
  revealed,
  typed,
  onTypedChange,
  onSubmit,
}: ListAnswerPanelProps) {
  return (
    <div className="mt-5 space-y-3">
      <p className="text-xs text-muted-foreground">
        Trouvés {foundItems.length} / {items.length}
      </p>
      <ul className="grid gap-1.5 sm:grid-cols-2">
        {items.map((item) => {
          const found = foundItems.includes(item);
          return (
            <li
              key={item}
              className={`rounded-lg border px-3 py-2 text-sm ${
                found || revealed
                  ? 'border-quiz-accent/40 bg-quiz-accent/10'
                  : 'border-dashed border-border text-muted-foreground'
              }`}
            >
              {found || revealed ? item : '•••'}
            </li>
          );
        })}
      </ul>
      {!revealed ? (
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <Input
            value={typed}
            onChange={(e) => onTypedChange(e.target.value)}
            placeholder="Un élément de la liste…"
            autoFocus
          />
          <Button type="submit" disabled={!typed.trim()}>
            OK
          </Button>
        </form>
      ) : null}
    </div>
  );
}
