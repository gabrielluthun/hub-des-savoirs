import { useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/primitives';
import { normalizeDeckName } from '@/features/anki/lib/decks';

interface DeckCreateFormProps {
  onCreate: (name: string) => boolean;
}

export function DeckCreateForm({ onCreate }: DeckCreateFormProps) {
  const [draft, setDraft] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const name = normalizeDeckName(draft);
    if (!name) return;
    const created = onCreate(name);
    if (created) setDraft('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-1.5 px-1 pt-1">
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Nouveau deck…"
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
