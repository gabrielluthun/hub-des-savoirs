import { Pencil, Trash2 } from 'lucide-react';
import type { AnkiCard } from '@/types';

interface CardListProps {
  cards: AnkiCard[];
  onEdit: (card: AnkiCard) => void;
  onDelete: (id: string) => void;
}

export function CardList({ cards, onEdit, onDelete }: CardListProps) {
  if (cards.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border p-8">
        <p className="text-sm text-muted-foreground">Aucune carte trouvée.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-2 overflow-y-auto pr-1">
      {cards.map((card) => (
        <div
          key={card.id}
          className="flex items-start gap-3 rounded-xl border border-border bg-card px-3 py-3"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{card.question}</p>
            <p className="mt-1 text-xs text-muted-foreground">{card.answer}</p>
          </div>
          <button
            type="button"
            onClick={() => onEdit(card)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Modifier la carte"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(card.id)}
            className="rounded-lg p-1.5 text-destructive hover:bg-destructive/10"
            aria-label="Supprimer la carte"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
