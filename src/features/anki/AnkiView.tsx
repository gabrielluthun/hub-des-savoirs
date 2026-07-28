import { useMemo, useState } from 'react';
import { Download, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { BulkImportPanel } from '@/features/anki/BulkImportPanel';
import { CardEditor } from '@/features/anki/CardEditor';
import { CardList } from '@/features/anki/CardList';
import { Button, Input } from '@/components/ui/primitives';
import { parseBulkAnkiInput, serializeAnkiCards } from '@/lib/anki-format';
import { downloadTextFile } from '@/lib/export';
import { createId } from '@/lib/utils';
import {
  addAnkiCard,
  addAnkiCards,
  deleteAnkiCard,
  updateAnkiCard,
} from '@/store/actions';
import { useStore } from '@/store/StoreProvider';
import { selectAnkiCards } from '@/store/selectors';
import type { AnkiCard } from '@/types';

export function AnkiView() {
  const { state, dispatch } = useStore();
  const cards = selectAnkiCards(state);
  const [query, setQuery] = useState('');
  const [bulk, setBulk] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftQuestion, setDraftQuestion] = useState('');
  const [draftAnswer, setDraftAnswer] = useState('');
  const [showEditor, setShowEditor] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter(
      (card) =>
        card.question.toLowerCase().includes(q) || card.answer.toLowerCase().includes(q)
    );
  }, [cards, query]);

  const openNew = () => {
    setEditingId(null);
    setDraftQuestion('');
    setDraftAnswer('');
    setShowEditor(true);
  };

  const openEdit = (card: AnkiCard) => {
    setEditingId(card.id);
    setDraftQuestion(card.question);
    setDraftAnswer(card.answer);
    setShowEditor(true);
  };

  const saveCard = () => {
    if (!draftQuestion.trim() || !draftAnswer.trim()) {
      toast.error('Question et réponse sont obligatoires.');
      return;
    }
    if (editingId) {
      dispatch(
        updateAnkiCard(editingId, {
          question: draftQuestion.trim(),
          answer: draftAnswer.trim(),
        })
      );
      toast.success('Carte mise à jour.');
    } else {
      dispatch(
        addAnkiCard({
          id: createId(),
          question: draftQuestion.trim(),
          answer: draftAnswer.trim(),
        })
      );
      toast.success('Carte ajoutée.');
    }
    setShowEditor(false);
  };

  const handleBulkImport = () => {
    const parsed = parseBulkAnkiInput(bulk);
    if (parsed.length === 0) {
      toast.error('Aucune carte valide à importer.');
      return;
    }
    dispatch(
      addAnkiCards(
        parsed.map((card) => ({
          id: createId(),
          question: card.question,
          answer: card.answer,
        }))
      )
    );
    setBulk('');
    toast.success(`${parsed.length} carte${parsed.length > 1 ? 's' : ''} ajoutée${parsed.length > 1 ? 's' : ''}.`);
  };

  const handleExport = () => {
    if (cards.length === 0) {
      toast.error('Aucune carte à exporter.');
      return;
    }
    downloadTextFile('anki-cards.txt', serializeAnkiCards(cards));
    toast.success('Export .txt téléchargé.');
  };

  return (
    <div className="flex h-full min-h-0 flex-col lg:flex-row">
      <div className="flex min-w-0 flex-1 flex-col p-5">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Cartes de révision
            </p>
            <h1 className="font-display text-2xl font-semibold">Anki — Éditeur & Export</h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Format d&apos;export natif : texte brut, une carte par ligne (Question → Réponse).
            </p>
          </div>
          <Button type="button" variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Exporter (.txt)
          </Button>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher…"
              className="pl-9"
            />
          </div>
          <Button type="button" variant="secondary" onClick={openNew}>
            <Plus className="h-4 w-4" />
            Nouvelle carte
          </Button>
          <span className="text-xs text-muted-foreground">
            {filtered.length} carte{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {showEditor ? (
          <div className="mb-4">
            <CardEditor
              question={draftQuestion}
              answer={draftAnswer}
              onQuestionChange={setDraftQuestion}
              onAnswerChange={setDraftAnswer}
              onSave={saveCard}
              onCancel={() => setShowEditor(false)}
              isEditing={Boolean(editingId)}
            />
          </div>
        ) : null}

        <CardList
          cards={filtered}
          onEdit={openEdit}
          onDelete={(id) => {
            dispatch(deleteAnkiCard(id));
            toast.success('Carte supprimée.');
          }}
        />
      </div>

      <BulkImportPanel value={bulk} onChange={setBulk} onImport={handleBulkImport} />
    </div>
  );
}
