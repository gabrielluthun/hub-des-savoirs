import type { GeneratedAnkiDraft } from '@/features/anki/lib/generate/generate-cards-from-doc';

interface GeneratePreviewListProps {
  drafts: GeneratedAnkiDraft[];
  selected: Set<number>;
  onToggle: (index: number) => void;
  onToggleAll: (selectAll: boolean) => void;
}

export function GeneratePreviewList({
  drafts,
  selected,
  onToggle,
  onToggleAll,
}: GeneratePreviewListProps) {
  if (drafts.length === 0) return null;

  const allSelected = selected.size === drafts.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {selected.size}/{drafts.length} sélectionnée{drafts.length > 1 ? 's' : ''}
        </p>
        <button
          type="button"
          onClick={() => onToggleAll(!allSelected)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
        </button>
      </div>
      <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
        {drafts.map((draft, index) => {
          const checked = selected.has(index);
          return (
            <li key={`${draft.question}-${index}`}>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(index)}
                  className="mt-1"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{draft.question}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {draft.answer}
                  </span>
                  {draft.mnemonic ? (
                    <span className="mt-0.5 block text-xs italic text-muted-foreground/80">
                      {draft.mnemonic}
                    </span>
                  ) : null}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
