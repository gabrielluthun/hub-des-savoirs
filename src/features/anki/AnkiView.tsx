import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { BulkImportPanel } from '@/features/anki/BulkImportPanel';
import { CardEditor } from '@/features/anki/CardEditor';
import { CardList } from '@/features/anki/CardList';
import { DeckSidebar } from '@/features/anki/components/decks/DeckSidebar';
import { GenerateFromDocPanel } from '@/features/anki/components/generate/GenerateFromDocPanel';
import { DeduplicationReport } from '@/features/anki/components/import/DeduplicationReport';
import { AnkiToolbar } from '@/features/anki/components/layout/AnkiToolbar';
import { ReviewSession } from '@/features/anki/components/review/ReviewSession';
import { useAnkiAiFromDocs } from '@/features/anki/hooks/useAnkiAiFromDocs';
import { useAnkiCardEditor } from '@/features/anki/hooks/useAnkiCardEditor';
import { useAnkiFilters } from '@/features/anki/hooks/useAnkiFilters';
import { useAnkiImportExport } from '@/features/anki/hooks/useAnkiImportExport';
import { useReviewQueue } from '@/features/anki/hooks/useReviewQueue';
import { DEFAULT_ANKI_DECK } from '@/features/anki/lib/decks';
import { Button, Input } from '@/components/ui/primitives';
import { deleteAnkiCard, updateAnkiCard } from '@/store/actions';
import { useStore } from '@/store/StoreProvider';
import { selectAnkiCards, selectDocs } from '@/store/selectors';

export function AnkiView() {
  const { state, dispatch } = useStore();
  const cards = selectAnkiCards(state);
  const docs = selectDocs(state);

  const filters = useAnkiFilters(cards);
  const editor = useAnkiCardEditor({
    dispatch,
    selectedDeck: filters.selectedDeck,
    selectedTags: filters.selectedTags,
  });
  const io = useAnkiImportExport({
    cards,
    scopedCards: filters.scopedCards,
    dispatch,
  });
  const aiFromDocs = useAnkiAiFromDocs({
    docs,
    apiKey: state.settings.apiKey,
    model: state.settings.model,
    dispatch,
    importParsedCards: io.importParsedCards,
  });

  const review = useReviewQueue(filters.reviewScope, (cardId, patch) => {
    dispatch(updateAnkiCard(cardId, patch));
  });

  const startReview = () => {
    if (review.dueCount === 0) {
      toast.message('Aucune carte due pour ce filtre.');
      return;
    }
    review.start();
  };

  return (
    <div className="flex h-full min-h-0 flex-col lg:flex-row">
      <DeckSidebar
        decks={filters.decks}
        deckCounts={filters.deckCounts}
        selectedDeck={filters.selectedDeck}
        onSelectDeck={filters.setSelectedDeck}
        allTags={filters.allTags}
        selectedTags={filters.selectedTags}
        onToggleTag={filters.toggleTag}
        onClearTags={filters.clearTags}
        totalCount={cards.length}
      />

      <div className="flex min-w-0 flex-1 flex-col p-5">
        <AnkiToolbar
          dueCount={review.dueCount}
          showAiPanel={aiFromDocs.showAiPanel}
          onStartReview={startReview}
          onToggleAiPanel={aiFromDocs.toggleAiPanel}
          onTxtFile={io.handleTxtFile}
          onExport={io.handleExport}
        />

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.query}
              onChange={(e) => filters.setQuery(e.target.value)}
              placeholder="Rechercher…"
              className="pl-9"
            />
          </div>
          <Button type="button" variant="secondary" onClick={editor.openNew}>
            <Plus className="h-4 w-4" />
            Nouvelle carte
          </Button>
          <span className="text-xs text-muted-foreground">
            {filters.scopedCards.length} carte{filters.scopedCards.length !== 1 ? 's' : ''}
          </span>
        </div>

        {aiFromDocs.showAiPanel ? (
          <GenerateFromDocPanel
            docs={docs}
            loading={aiFromDocs.ai.loading}
            drafts={aiFromDocs.ai.drafts}
            defaultDeck={filters.selectedDeck ?? DEFAULT_ANKI_DECK}
            deckSuggestions={filters.decks}
            hasApiKey={Boolean(state.settings.apiKey.trim())}
            onNeedApiKey={aiFromDocs.handleNeedApiKey}
            onGenerate={aiFromDocs.handleAiGenerate}
            onClear={aiFromDocs.ai.clear}
            onSave={aiFromDocs.handleAiSave}
          />
        ) : null}

        {io.deduplicationReport ? (
          <DeduplicationReport
            added={io.deduplicationReport.added}
            skipped={io.deduplicationReport.skipped}
            skippedQuestions={io.deduplicationReport.skippedQuestions}
            onDismiss={io.dismissDeduplicationReport}
          />
        ) : null}

        {editor.showEditor ? (
          <div className="mb-4">
            <CardEditor
              question={editor.draftQuestion}
              answer={editor.draftAnswer}
              mnemonic={editor.draftMnemonic}
              deck={editor.draftDeck}
              tags={editor.draftTags}
              tagSuggestions={filters.allTags}
              deckSuggestions={filters.decks}
              onQuestionChange={editor.setDraftQuestion}
              onAnswerChange={editor.setDraftAnswer}
              onMnemonicChange={editor.setDraftMnemonic}
              onDeckChange={editor.setDraftDeck}
              onTagsChange={editor.setDraftTags}
              onSave={editor.saveCard}
              onCancel={editor.closeEditor}
              isEditing={Boolean(editor.editingId)}
            />
          </div>
        ) : null}

        <CardList
          cards={filters.scopedCards}
          onEdit={editor.openEdit}
          onDelete={(id) => {
            dispatch(deleteAnkiCard(id));
            toast.success('Carte supprimée.');
          }}
        />
      </div>

      <BulkImportPanel
        value={io.bulk}
        onChange={io.setBulk}
        onImport={io.handleBulkImport}
      />

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
