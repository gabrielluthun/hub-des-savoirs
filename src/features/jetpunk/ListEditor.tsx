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
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Contenu de la liste
        </p>
        <Button type="button" variant="secondary" size="sm" onClick={onAddItem}>
          <Plus className="h-3.5 w-3.5" />
          Ajouter
        </Button>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <Input
              value={item.prompt}
              onChange={(e) => onChangeItem(item.id, { prompt: e.target.value })}
              placeholder="Indice / pays"
              className="flex-1"
            />
            <Input
              value={item.answer}
              onChange={(e) => onChangeItem(item.id, { answer: e.target.value })}
              placeholder="Réponse"
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => onDeleteItem(item.id)}
              className="rounded-lg p-2 text-destructive hover:bg-destructive/10"
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
