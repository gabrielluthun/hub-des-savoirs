import { cn } from '@/lib/utils';
import type { HubDocument, JetPunkList, QuizSource, QuizSourceSelection } from '@/types';

interface SourcePickerProps {
  selection: QuizSourceSelection;
  docs: HubDocument[];
  deckNames: string[];
  lists: JetPunkList[];
  onChange: (selection: QuizSourceSelection) => void;
}

function CheckboxRow({
  checked,
  label,
  hint,
  onToggle,
}: {
  checked: boolean;
  label: string;
  hint?: string;
  onToggle: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 hover:bg-secondary/60">
      <input
        type="checkbox"
        className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[hsl(var(--quiz-accent))]"
        checked={checked}
        onChange={onToggle}
      />
      <span className="min-w-0">
        <span className="block truncate text-sm">{label}</span>
        {hint ? (
          <span className="block truncate text-[11px] text-muted-foreground">{hint}</span>
        ) : null}
      </span>
    </label>
  );
}

export function SourcePicker({
  selection,
  docs,
  deckNames,
  lists,
  onChange,
}: SourcePickerProps) {
  if (selection.kind === 'all') {
    return (
      <p className="mt-3 text-xs text-muted-foreground">
        Toutes les notes, cartes et listes non vides seront utilisées. Choisis Docs, Anki ou
        JetPunk pour cibler des ressources précises.
      </p>
    );
  }

  const usableDocs = docs.filter((doc) => doc.content.trim());
  const usableLists = lists.filter((list) =>
    list.items.some((item) => item.prompt.trim() || item.answer.trim())
  );

  let title = '';
  let emptyLabel = '';
  let selectedCount = 0;
  let totalCount = 0;
  let rows: { id: string; label: string; hint?: string; checked: boolean }[] = [];

  if (selection.kind === 'docs') {
    title = 'Documents';
    emptyLabel = 'Aucun document avec du contenu.';
    totalCount = usableDocs.length;
    selectedCount = selection.docIds.filter((id) =>
      usableDocs.some((doc) => doc.id === id)
    ).length;
    rows = usableDocs.map((doc) => ({
      id: doc.id,
      label: doc.title.trim() || 'Sans titre',
      hint: doc.tags.length ? doc.tags.join(', ') : undefined,
      checked: selection.docIds.includes(doc.id),
    }));
  } else if (selection.kind === 'anki') {
    title = 'Decks Anki';
    emptyLabel = 'Aucun deck disponible.';
    totalCount = deckNames.length;
    selectedCount = selection.deckNames.filter((name) => deckNames.includes(name)).length;
    rows = deckNames.map((name) => ({
      id: name,
      label: name,
      checked: selection.deckNames.includes(name),
    }));
  } else {
    title = 'Listes JetPunk';
    emptyLabel = 'Aucune liste jouable.';
    totalCount = usableLists.length;
    selectedCount = selection.listIds.filter((id) =>
      usableLists.some((list) => list.id === id)
    ).length;
    rows = usableLists.map((list) => ({
      id: list.id,
      label: list.title.trim() || 'Sans titre',
      hint: `${list.category} · ${list.items.length} élément${list.items.length !== 1 ? 's' : ''}`,
      checked: selection.listIds.includes(list.id),
    }));
  }

  const patchIds = (kind: QuizSource, ids: string[]): QuizSourceSelection => {
    if (kind === 'docs') return { ...selection, docIds: ids };
    if (kind === 'anki') return { ...selection, deckNames: ids };
    return { ...selection, listIds: ids };
  };

  const allIds = rows.map((row) => row.id);

  return (
    <div className="mt-4 rounded-xl border border-border">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <p className="text-xs font-medium">
          {title}{' '}
          <span className="font-normal text-muted-foreground">
            ({selectedCount}/{totalCount})
          </span>
        </p>
        <div className="flex gap-2 text-[11px]">
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => onChange(patchIds(selection.kind, allIds))}
            disabled={totalCount === 0}
          >
            Tout
          </button>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => onChange(patchIds(selection.kind, []))}
            disabled={selectedCount === 0}
          >
            Aucun
          </button>
        </div>
      </div>
      <div className={cn('max-h-44 overflow-y-auto p-1.5', totalCount === 0 && 'px-3 py-3')}>
        {totalCount === 0 ? (
          <p className="text-xs text-muted-foreground">{emptyLabel}</p>
        ) : (
          rows.map((row) => (
            <CheckboxRow
              key={row.id}
              checked={row.checked}
              label={row.label}
              hint={row.hint}
              onToggle={() => {
                const current =
                  selection.kind === 'docs'
                    ? selection.docIds
                    : selection.kind === 'anki'
                      ? selection.deckNames
                      : selection.listIds;
                const next = current.includes(row.id)
                  ? current.filter((id) => id !== row.id)
                  : [...current, row.id];
                onChange(patchIds(selection.kind, next));
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
