import { Plus, Trash2 } from 'lucide-react';
import { Button, Input } from '@/components/ui/primitives';
import type { JetPunkItem } from '@/types';

interface ListEditorProps {
  items: JetPunkItem[];
  onChangeItem: (id: string, patch: Partial<JetPunkItem>) => void;
  onAddItem: () => void;
  onDeleteItem: (id: string) => void;
}

export function ListEditor({
  items,
  onChangeItem,
  onAddItem,
  onDeleteItem,
}: ListEditorProps) {
  const isSparse =
    items.length === 0 ||
    items.every((item) => !item.prompt.trim() && !item.answer.trim());

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Contenu de la liste
          </p>
          {isSparse ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Ajoute des paires indice → réponse. Seule la réponse compte pour le quiz.
            </p>
          ) : null}
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={onAddItem}>
          <Plus className="h-3.5 w-3.5" />
          Ajouter
        </Button>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="flex flex-col gap-2 rounded-xl border border-border/70 bg-card/40 p-2 sm:flex-row sm:items-center"
          >
            <span className="hidden w-6 shrink-0 text-center text-xs tabular-nums text-muted-foreground sm:block">
              {index + 1}
            </span>
            <Input
              value={item.prompt}
              onChange={(e) => onChangeItem(item.id, { prompt: e.target.value })}
              placeholder="Indice (optionnel) — ex. Capitale du Japon"
              className="min-w-0 flex-1"
            />
            <Input
              value={item.answer}
              onChange={(e) => onChangeItem(item.id, { answer: e.target.value })}
              placeholder="Réponse — ex. Tokyo"
              className="min-w-0 flex-1"
            />
            <button
              type="button"
              onClick={() => onDeleteItem(item.id)}
              className="self-end rounded-lg p-2 text-destructive hover:bg-destructive/10 sm:self-auto"
              aria-label="Supprimer l'élément"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
