import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { DeckField } from '@/features/anki/components/decks/DeckField';
import { GeneratePreviewList } from '@/features/anki/components/generate/GeneratePreviewList';
import type { GeneratedAnkiDraft } from '@/features/anki/lib/generate/generate-cards-from-doc';
import { Button, Input, Label, Select } from '@/components/ui/primitives';
import type { HubDocument } from '@/types';

interface GenerateFromDocPanelProps {
  docs: HubDocument[];
  loading: boolean;
  drafts: GeneratedAnkiDraft[];
  defaultDeck: string;
  deckSuggestions: string[];
  onGenerate: (params: { docId: string; count: number; deck: string }) => void;
  onClear: () => void;
  onSave: (params: {
    drafts: GeneratedAnkiDraft[];
    deck: string;
    indices: number[];
  }) => void;
  onNeedApiKey: () => void;
  hasApiKey: boolean;
}

export function GenerateFromDocPanel({
  docs,
  loading,
  drafts,
  defaultDeck,
  deckSuggestions,
  onGenerate,
  onClear,
  onSave,
  onNeedApiKey,
  hasApiKey,
}: GenerateFromDocPanelProps) {
  const docsWithContent = docs.filter((doc) => doc.content.trim());
  const [docId, setDocId] = useState(docsWithContent[0]?.id ?? '');
  const [count, setCount] = useState(8);
  const [deck, setDeck] = useState(defaultDeck);
  const [selected, setSelected] = useState<Set<number>>(() => new Set());

  useEffect(() => {
    if (!docsWithContent.some((doc) => doc.id === docId)) {
      setDocId(docsWithContent[0]?.id ?? '');
    }
  }, [docsWithContent, docId]);

  useEffect(() => {
    setSelected(new Set(drafts.map((_, index) => index)));
  }, [drafts]);

  useEffect(() => {
    setDeck(defaultDeck);
  }, [defaultDeck]);

  const handleGenerate = () => {
    if (!hasApiKey) {
      onNeedApiKey();
      return;
    }
    if (!docId) return;
    onGenerate({ docId, count, deck });
  };

  const handleSave = () => {
    onSave({
      drafts,
      deck,
      indices: [...selected].sort((a, b) => a - b),
    });
  };

  return (
    <div className="mb-4 space-y-3 rounded-xl border border-border bg-card p-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Génération IA
        </p>
        <h3 className="font-display text-lg font-semibold">Depuis un document</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Gemini crée des cartes Q/R (+ mnémotechnique) à partir d’une note Docs, en
          ciblant le thème du deck, avec citation source pour vérification.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Document source</Label>
          <Select
            value={docId}
            onChange={(e) => setDocId(e.target.value)}
            disabled={docsWithContent.length === 0 || loading}
          >
            {docsWithContent.length === 0 ? (
              <option value="">Aucun document avec contenu</option>
            ) : (
              docsWithContent.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.title}
                </option>
              ))
            )}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Nombre de cartes</Label>
          <Input
            type="number"
            min={1}
            max={30}
            value={count}
            onChange={(e) => setCount(Math.min(30, Math.max(1, Number(e.target.value) || 1)))}
            disabled={loading}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Deck cible</Label>
          <DeckField value={deck} onChange={setDeck} suggestions={deckSuggestions} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="accent"
          onClick={handleGenerate}
          disabled={loading || !docId}
        >
          <Sparkles className={`h-4 w-4 ${loading ? 'animate-pulse' : ''}`} />
          {loading ? 'Génération…' : 'Générer'}
        </Button>
        {drafts.length > 0 ? (
          <>
            <Button type="button" onClick={handleSave} disabled={selected.size === 0 || loading}>
              Ajouter la sélection ({selected.size})
            </Button>
            <Button type="button" variant="ghost" onClick={onClear} disabled={loading}>
              Effacer l’aperçu
            </Button>
          </>
        ) : null}
      </div>

      <GeneratePreviewList
        drafts={drafts}
        selected={selected}
        onToggle={(index) => {
          setSelected((current) => {
            const next = new Set(current);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            return next;
          });
        }}
        onToggleAll={(selectAll) => {
          setSelected(selectAll ? new Set(drafts.map((_, i) => i)) : new Set());
        }}
      />
    </div>
  );
}
