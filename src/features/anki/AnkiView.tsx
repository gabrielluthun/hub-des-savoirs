import { useMemo, useState } from 'react';
import { Download, Plus, Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { BulkImportPanel } from '@/features/anki/BulkImportPanel';
import { CardEditor } from '@/features/anki/CardEditor';
import { CardList } from '@/features/anki/CardList';
import { DeckSidebar } from '@/features/anki/components/decks/DeckSidebar';
import { TxtImportButton } from '@/features/anki/components/import/TxtImportButton';
import { ReviewSession } from '@/features/anki/components/review/ReviewSession';
import { useReviewQueue } from '@/features/anki/hooks/useReviewQueue';
import { DEFAULT_ANKI_DECK, normalizeDeckName } from '@/features/anki/lib/decks';
import {
  collectCardTags,
  collectDecks,
  countCardsInDeck,
  filterCards,
} from '@/features/anki/lib/organization';
import { createAnkiCard } from '@/features/anki/lib/srs/card-factory';
import { normalizeTag } from '@/features/anki/lib/tags';
import { Button, Input } from '@/components/ui/primitives';
import { parseBulkAnkiInput, serializeAnkiCards } from '@/lib/anki-format';
import { downloadTextFile } from '@/lib/export';
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
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftQuestion, setDraftQuestion] = useState('');
  const [draftAnswer, setDraftAnswer] = useState('');
  const [draftMnemonic, setDraftMnemonic] = useState('');
  const [draftDeck, setDraftDeck] = useState(DEFAULT_ANKI_DECK);
  const [draftTags, setDraftTags] = useState<string[]>([]);
  const [showEditor, setShowEditor] = useState(false);

  const decks = useMemo(() => collectDecks(cards), [cards]);
  const allTags = useMemo(() => collectCardTags(cards), [cards]);
  const deckCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const deck of decks) {
      counts[deck] = countCardsInDeck(cards, deck);
    }
    return counts;
  }, [cards, decks]);

  const scopedCards = useMemo(
    () => filterCards(cards, { deck: selectedDeck, tags: selectedTags, query }),
    [cards, selectedDeck, selectedTags, query]
  );

  const reviewScope = useMemo(
    () => filterCards(cards, { deck: selectedDeck, tags: selectedTags }),
    [cards, selectedDeck, selectedTags]
  );

  const review = useReviewQueue(reviewScope, (cardId, patch) => {
    dispatch(updateAnkiCard(cardId, patch));
  });

  const importParsedCards = (
    parsed: {
      question: string;
      answer: string;
      deck: string;
      mnemonic: string;
      tags: string[];
    }[]
  ) => {
    if (parsed.length === 0) {
      toast.error('Aucune carte valide à importer.');
      return;
    }
    dispatch(
      addAnkiCards(
        parsed.map((card) =>
          createAnkiCard({
            question: card.question,
            answer: card.answer,
            mnemonic: card.mnemonic,
            deck: card.deck,
            tags: card.tags,
          })
        )
      )
    );
    toast.success(
      `${parsed.length} carte${parsed.length > 1 ? 's' : ''} ajoutée${parsed.length > 1 ? 's' : ''}.`
    );
  };

  const openNew = () => {
    setEditingId(null);
    setDraftQuestion('');
    setDraftAnswer('');
    setDraftMnemonic('');
    setDraftDeck(selectedDeck ?? DEFAULT_ANKI_DECK);
    setDraftTags([...selectedTags]);
    setShowEditor(true);
  };

  const openEdit = (card: AnkiCard) => {
    setEditingId(card.id);
    setDraftQuestion(card.question);
    setDraftAnswer(card.answer);
    setDraftMnemonic(card.mnemonic ?? '');
    setDraftDeck(card.deck || DEFAULT_ANKI_DECK);
    setDraftTags([...(card.tags ?? [])]);
    setShowEditor(true);
  };

  const saveCard = () => {
    if (!draftQuestion.trim() || !draftAnswer.trim()) {
      toast.error('Question et réponse sont obligatoires.');
      return;
    }
    if (!draftDeck.trim()) {
      toast.error('Le deck est obligatoire.');
      return;
    }
    const deck = normalizeDeckName(draftDeck);
    const mnemonic = draftMnemonic.trim();
    if (editingId) {
      dispatch(
        updateAnkiCard(editingId, {
          question: draftQuestion.trim(),
          answer: draftAnswer.trim(),
          mnemonic,
          deck,
          tags: draftTags,
        })
      );
      toast.success('Carte mise à jour.');
    } else {
      dispatch(
        addAnkiCard(
          createAnkiCard({
            question: draftQuestion.trim(),
            answer: draftAnswer.trim(),
            mnemonic,
            deck,
            tags: draftTags,
          })
        )
      );
      toast.success('Carte ajoutée.');
    }
    setShowEditor(false);
  };

  const handleBulkImport = () => {
    const parsed = parseBulkAnkiInput(bulk);
    importParsedCards(parsed);
    if (parsed.length > 0) setBulk('');
  };

  const handleTxtFile = async (file: File) => {
    try {
      const text = await file.text();
      importParsedCards(parseBulkAnkiInput(text));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Échec de l'import .txt.");
    }
  };

  const handleExport = () => {
    if (scopedCards.length === 0) {
      toast.error('Aucune carte à exporter.');
      return;
    }
    downloadTextFile('anki-cards.txt', serializeAnkiCards(scopedCards));
    toast.success('Export .txt téléchargé.');
  };

  const startReview = () => {
    if (review.dueCount === 0) {
      toast.message('Aucune carte due pour ce filtre.');
      return;
    }
    review.start();
  };

  const toggleTag = (tag: string) => {
    const normalized = normalizeTag(tag);
    setSelectedTags((current) =>
      current.includes(normalized)
        ? current.filter((t) => t !== normalized)
        : [...current, normalized]
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col lg:flex-row">
      <DeckSidebar
        decks={decks}
        deckCounts={deckCounts}
        selectedDeck={selectedDeck}
        onSelectDeck={setSelectedDeck}
        allTags={allTags}
        selectedTags={selectedTags}
        onToggleTag={toggleTag}
        onClearTags={() => setSelectedTags([])}
        totalCount={cards.length}
      />

      <div className="flex min-w-0 flex-1 flex-col p-5">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Cartes de révision
            </p>
            <h1 className="font-display text-2xl font-semibold">Anki — Éditeur & Export</h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Format .txt : Question;Réponse;Deck (;Mnémotechnique;Tags optionnels).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="accent" onClick={startReview}>
              <Sparkles className="h-4 w-4" />
              Réviser ({review.dueCount})
            </Button>
            <TxtImportButton onFile={handleTxtFile} />
            <Button type="button" variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Exporter .txt
            </Button>
          </div>
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
            {scopedCards.length} carte{scopedCards.length !== 1 ? 's' : ''}
          </span>
        </div>

        {showEditor ? (
          <div className="mb-4">
            <CardEditor
              question={draftQuestion}
              answer={draftAnswer}
              mnemonic={draftMnemonic}
              deck={draftDeck}
              tags={draftTags}
              tagSuggestions={allTags}
              deckSuggestions={decks}
              onQuestionChange={setDraftQuestion}
              onAnswerChange={setDraftAnswer}
              onMnemonicChange={setDraftMnemonic}
              onDeckChange={setDraftDeck}
              onTagsChange={setDraftTags}
              onSave={saveCard}
              onCancel={() => setShowEditor(false)}
              isEditing={Boolean(editingId)}
            />
          </div>
        ) : null}

        <CardList
          cards={scopedCards}
          onEdit={openEdit}
          onDelete={(id) => {
            dispatch(deleteAnkiCard(id));
            toast.success('Carte supprimée.');
          }}
        />
      </div>

      <BulkImportPanel value={bulk} onChange={setBulk} onImport={handleBulkImport} />

      {review.active ? (
        <ReviewSession
          current={review.current}
          remaining={review.remaining}
          reviewedCount={review.reviewedCount}
          revealed={review.revealed}
          onReveal={review.reveal}
          onGrade={review.grade}
          onClose={review.stop}
        />
      ) : null}
    </div>
  );
}
