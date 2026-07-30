import { useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { consumeNavIntent, subscribeNavIntent } from '@/app/nav-intent';
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
import { deckExists } from '@/features/anki/lib/organization';
import {
  computeRenamedDecks,
  deckIsUnder,
  decksEqual,
  normalizeDeckName,
} from '@/features/anki/lib/decks';
import { getDueCards } from '@/features/anki/lib/srs/schedule';
import { ankiCardsToJetpunkList } from '@/lib/anki-jetpunk-transfer';
import { confirmAction } from '@/lib/confirm';
import { Button, Input } from '@/components/ui/primitives';
import {
  addAnkiDeck,
  addJetpunkList,
  deleteAnkiCard,
  removeAnkiDeck,
  renameAnkiDeck,
  setActiveJetpunkList,
  setTab,
  updateAnkiCard,
} from '@/store/actions';
import { useStore } from '@/store/StoreProvider';
import { selectAnkiCards, selectAnkiDecks, selectDocs } from '@/store/selectors';

export function AnkiView() {
  const { state, dispatch } = useStore();
  const cards = selectAnkiCards(state);
  const registeredDecks = selectAnkiDecks(state);
  const docs = selectDocs(state);

  const filters = useAnkiFilters(cards, registeredDecks);
  const editor = useAnkiCardEditor({
    dispatch,
    selectedDeck: filters.selectedDeck,
    selectedTags: filters.selectedTags,
  });
  const io = useAnkiImportExport({
    cards,
    scopedCards: filters.scopedCards,
    selectedDeck: filters.selectedDeck,
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

  useEffect(() => {
    const tryStartFromSidebar = () => {
      if (!consumeNavIntent('anki-review')) return;
      // Sidebar counts all due cards — clear filters and review that full set.
      filters.setSelectedDeck(null);
      filters.clearTags();
      filters.setQuery('');
      if (getDueCards(cards).length === 0) {
        toast.message('Aucune carte due pour le moment.');
        return;
      }
      review.start(cards);
    };
    tryStartFromSidebar();
    return subscribeNavIntent(tryStartFromSidebar);
  }, [
    cards,
    filters.clearTags,
    filters.setQuery,
    filters.setSelectedDeck,
    review.start,
  ]);

  const handleCreateDeck = (name: string) => {
    if (deckExists(filters.decks, name)) {
      toast.message(`Le deck « ${name} » existe déjà.`);
      filters.setSelectedDeck(
        filters.decks.find((deck) => deck.toLowerCase() === name.toLowerCase()) ?? name
      );
      return false;
    }
    dispatch(addAnkiDeck(name));
    filters.setSelectedDeck(name);
    toast.success(`Deck « ${name} » créé.`);
    return true;
  };

  const handleTransferToJetpunk = () => {
    const list = ankiCardsToJetpunkList(filters.scopedCards, {
      deck: filters.selectedDeck ?? undefined,
    });
    if (!list) {
      toast.error('Aucune carte transférable (il faut au moins une réponse).');
      return;
    }
    dispatch(addJetpunkList(list));
    dispatch(setActiveJetpunkList(list.id));
    dispatch(setTab('jetpunk'));
    toast.success(
      `Liste JetPunk « ${list.title} » (${list.category}) créée — ${list.items.length} élément${list.items.length !== 1 ? 's' : ''}.`
    );
  };

  const handleDeleteDeck = (name: string) => {
    void (async () => {
      const count = filters.deckCounts[name] ?? 0;
      const nested = filters.decks.filter(
        (deck) => deckIsUnder(deck, name) && !decksEqual(deck, name)
      ).length;
      const message =
        count === 0 && nested === 0
          ? `Supprimer le deck « ${name} » ?`
          : nested > 0
            ? `Supprimer « ${name} », ses ${nested} sous-deck${nested > 1 ? 's' : ''} et ${count} carte${count > 1 ? 's' : ''} ? Cette action est définitive.`
            : `Supprimer le deck « ${name} » et ses ${count} carte${count > 1 ? 's' : ''} ? Cette action est définitive.`;
      const confirmed = await confirmAction(message, {
        title: 'Supprimer le deck',
        okLabel: 'Supprimer',
      });
      if (!confirmed) return;

      dispatch(removeAnkiDeck(name));
      if (filters.selectedDeck && deckIsUnder(filters.selectedDeck, name)) {
        filters.setSelectedDeck(null);
      }
      toast.success(`Deck « ${name} » supprimé.`);
    })();
  };

  const handleRenameDeck = (nextName: string): boolean => {
    const from = filters.selectedDeck;
    if (!from) return false;

    const to = normalizeDeckName(nextName);
    if (!to) {
      toast.message('Le nom du deck ne peut pas être vide.');
      return false;
    }
    if (decksEqual(from, to)) {
      if (from !== to) {
        dispatch(renameAnkiDeck(from, to));
        filters.setSelectedDeck(to);
      }
      return true;
    }

    const renamed = computeRenamedDecks(filters.decks, from, to);
    if (!renamed) {
      toast.error(`Impossible de renommer : « ${to} » existe déjà.`);
      return false;
    }

    dispatch(renameAnkiDeck(from, to));
    filters.setSelectedDeck(to);
    toast.success(`Deck renommé en « ${to} ».`);
    return true;
  };

  return (
    <div className="flex h-full min-h-0 flex-col lg:flex-row">
      <DeckSidebar
        decks={filters.decks}
        deckCounts={filters.deckCounts}
        selectedDeck={filters.selectedDeck}
        onSelectDeck={filters.setSelectedDeck}
        onCreateDeck={handleCreateDeck}
        onDeleteDeck={handleDeleteDeck}
        allTags={filters.allTags}
        selectedTags={filters.selectedTags}
        onToggleTag={filters.toggleTag}
        onClearTags={filters.clearTags}
        totalCount={cards.length}
      />

      <div className="flex min-w-0 flex-1 flex-col p-5">
        <AnkiToolbar
          selectedDeck={filters.selectedDeck}
          dueCount={review.dueCount}
          showAiPanel={aiFromDocs.showAiPanel}
          transferCount={filters.scopedCards.length}
          onRenameDeck={handleRenameDeck}
          onStartReview={startReview}
          onToggleAiPanel={aiFromDocs.toggleAiPanel}
          onTxtFile={io.handleTxtFile}
          onExport={io.handleExport}
          onTransferToJetpunk={handleTransferToJetpunk}
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
            defaultDeck={filters.selectedDeck ?? ''}
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
        targetDeck={filters.selectedDeck}
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
