import { useEffect, useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { DECK_PATH_SEP, normalizeDeckName } from '@/features/anki/lib/decks';
import { Input } from '@/components/ui/primitives';

interface DeckCreateFormProps {
  onCreate: (name: string) => boolean;
  /** When a deck is selected, prefill Parent:: for a quick sous-deck. */
  parentHint?: string | null;
}

export function DeckCreateForm({ onCreate, parentHint = null }: DeckCreateFormProps) {
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (!parentHint) return;
    setDraft((current) => {
      if (current.trim()) return current;
      return `${parentHint}${DECK_PATH_SEP}`;
    });
  }, [parentHint]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const name = normalizeDeckName(draft);
    if (!name) return;
    const created = onCreate(name);
    if (created) {
      setDraft(parentHint ? `${parentHint}${DECK_PATH_SEP}` : '');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-1.5 px-1 pt-1">
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={parentHint ? `${parentHint}${DECK_PATH_SEP}Enfant` : 'Nouveau deck…'}
        className="h-8 flex-1 text-xs"
        aria-label="Nom du nouveau deck"
      />
      <button
        type="submit"
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
        aria-label="Créer le deck"
      >
        <Plus className="h-4 w-4" />
      </button>
    </form>
  );
}
