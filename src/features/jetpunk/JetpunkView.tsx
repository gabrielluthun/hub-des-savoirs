import { useEffect, useMemo, useState } from 'react';
import { Download, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { consumeNavIntent, subscribeNavIntent } from '@/app/nav-intent';
import {
  buildExistingQuestionKeys,
  partitionByQuestionDeduplication,
} from '@/features/anki/lib/import/deduplication';
import { Historique } from '@/features/jetpunk/Historique';
import { JetpunkHelp } from '@/features/jetpunk/components/help/JetpunkHelpDialog';
import { ItemMissStats } from '@/features/jetpunk/components/ItemMissStats';
import { QuizLaunchBar } from '@/features/jetpunk/components/QuizLaunchBar';
import { useJetpunkExport } from '@/features/jetpunk/hooks/useJetpunkExport';
import { useJetpunkImport } from '@/features/jetpunk/hooks/useJetpunkImport';
import { ListEditor } from '@/features/jetpunk/ListEditor';
import { ListSidebar } from '@/features/jetpunk/ListSidebar';
import { QuizRunner } from '@/features/jetpunk/QuizRunner';
import type { QuizResult } from '@/features/jetpunk/Stats';
import {
  computeItemMissStats,
  pickFocusItems,
} from '@/features/jetpunk/lib/item-stats';
import { jetpunkListToAnkiCards } from '@/lib/anki-jetpunk-transfer';
import { confirmAction } from '@/lib/confirm';
import { Button, Input } from '@/components/ui/primitives';
import { createId } from '@/lib/utils';
import type { JetPunkItem } from '@/types';
import {
  addAnkiCards,
  addJetpunkHistory,
  addJetpunkList,
  deleteJetpunkList,
  setActiveJetpunkList,
  setTab,
  updateJetpunkList,
} from '@/store/actions';
import { useStore } from '@/store/StoreProvider';
import {
  selectActiveJetpunkList,
  selectAnkiCards,
  selectJetpunkHistory,
  selectJetpunkLists,
} from '@/store/selectors';

export function JetPunkView() {
  const { state, dispatch } = useStore();
  const lists = selectJetpunkLists(state);
  const activeList = selectActiveJetpunkList(state);
  const ankiCards = selectAnkiCards(state);
  const history = selectJetpunkHistory(state) ?? [];
  const { exportList, exportAll } = useJetpunkExport();
  const { importFile } = useJetpunkImport(dispatch);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizItems, setQuizItems] = useState<JetPunkItem[] | null>(null);

  useEffect(() => {
    const tryStartFromSidebar = () => {
      const intent = consumeNavIntent('jetpunk-quiz');
      if (!intent) return;
      const list = lists.find((entry) => entry.id === intent.listId);
      if (!list) {
        toast.message('Cette liste JetPunk n’existe plus.');
        return;
      }
      if (!list.items.some((item) => item.answer.trim())) {
        toast.message('Aucune réponse jouable dans cette liste.');
        return;
      }
      dispatch(setActiveJetpunkList(list.id));
      setQuizItems(null);
      setQuizOpen(true);
    };
    tryStartFromSidebar();
    return subscribeNavIntent(tryStartFromSidebar);
  }, [dispatch, lists]);

  const listHistory = useMemo(() => {
    if (!activeList) return [];
    return history.filter((entry) => entry.listId === activeList.id);
  }, [activeList, history]);
  const missStats = useMemo(
    () => (activeList ? computeItemMissStats(activeList.items, listHistory) : []),
    [activeList, listHistory]
  );
  const previousBest =
    listHistory.length > 0
      ? Math.max(...listHistory.map((entry) => entry.score))
      : null;
  const lastScore = listHistory[0]?.score ?? 0;

  const handleQuizFinish = (result: QuizResult) => {
    if (!activeList) return;
    dispatch(
      addJetpunkHistory({
        id: createId(),
        listId: activeList.id,
        listTitle: activeList.title,
        score: result.score,
        total: result.total,
        durationSec: result.durationSec,
        elapsedSec: result.elapsedSec,
        playedAt: new Date().toISOString(),
        foundIds: result.foundIds,
      })
    );
  };

  const handleAddList = () => {
    dispatch(
      addJetpunkList({
        id: createId(),
        title: '',
        category: 'Général',
        durationSec: 90,
        items: [{ id: createId(), prompt: '', answer: '' }],
      })
    );
  };

  const handleDeleteList = (id: string) => {
    void (async () => {
      const list = lists.find((entry) => entry.id === id);
      const label = list?.title?.trim() || 'cette liste';
      const confirmed = await confirmAction(
        `Supprimer « ${label} » ? Cette action est définitive.`,
        { title: 'Supprimer la liste', okLabel: 'Supprimer' }
      );
      if (!confirmed) return;
      dispatch(deleteJetpunkList(id));
      toast.success('Liste supprimée.');
    })();
  };

  const handleTransferToAnki = () => {
    if (!activeList) return;
    const cards = jetpunkListToAnkiCards(activeList);
    if (cards.length === 0) {
      toast.error('Aucun élément transférable (il faut au moins une réponse).');
      return;
    }
    const { unique, duplicates } = partitionByQuestionDeduplication(
      cards,
      buildExistingQuestionKeys(ankiCards)
    );
    if (unique.length === 0) {
      toast.message(
        `Tous les doublons ont été ignorés (${duplicates.length} carte${duplicates.length !== 1 ? 's' : ''}).`
      );
      return;
    }
    dispatch(addAnkiCards(unique));
    dispatch(setTab('anki'));
    toast.success(
      `${unique.length} carte${unique.length !== 1 ? 's' : ''} Anki créée${unique.length !== 1 ? 's' : ''} (deck « ${unique[0]?.deck} »)${
        duplicates.length > 0
          ? ` — ${duplicates.length} doublon${duplicates.length !== 1 ? 's' : ''} ignoré${duplicates.length !== 1 ? 's' : ''}`
          : ''
      }.`
    );
  };

  const sidebarProps = {
    lists,
    onSelect: (id: string) => dispatch(setActiveJetpunkList(id)),
    onAdd: handleAddList,
    onDelete: handleDeleteList,
    onExportAll: () => exportAll(lists),
    onImportFile: (file: File) => {
      void importFile(file);
    },
  };

  if (!activeList) {
    return (
      <div className="flex h-full min-h-0 flex-col md:flex-row">
        <ListSidebar {...sidebarProps} activeListId={null} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto p-5">
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
            <p>Aucune liste sélectionnée.</p>
            <p className="text-xs">Crée une liste (+) ou importe un fichier JSON.</p>
          </div>
        </div>
        <JetpunkHelp />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col md:flex-row">
      <ListSidebar {...sidebarProps} activeListId={activeList.id} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto p-5">
        <div className="mb-3 flex items-start gap-2">
          <input
            value={activeList.title}
            onChange={(e) =>
              dispatch(updateJetpunkList(activeList.id, { title: e.target.value }))
            }
            placeholder="Nom de la liste"
            className="min-w-0 flex-1 bg-transparent font-display text-2xl font-semibold outline-none placeholder:text-muted-foreground/50"
          />
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTransferToAnki}
              title="Créer des cartes Anki (deck Thème::Liste, ex. Géographie::Capitales)"
            >
              <Layers className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Vers Anki</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => exportList(activeList)}
              title="Exporter cette liste en JSON"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Exporter cette liste</span>
            </Button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Input
            list="jetpunk-categories"
            value={activeList.category}
            onChange={(e) =>
              dispatch(updateJetpunkList(activeList.id, { category: e.target.value }))
            }
            placeholder="Catégorie"
            className="h-8 w-auto min-w-[7rem] rounded-full px-3 text-xs"
          />
          <datalist id="jetpunk-categories">
            {[...new Set(lists.map((list) => list.category.trim()).filter(Boolean))]
              .sort((a, b) => a.localeCompare(b, 'fr'))
              .map((category) => (
                <option key={category} value={category} />
              ))}
          </datalist>
          <span className="text-xs text-muted-foreground">
            {activeList.items.length} élément
            {activeList.items.length !== 1 ? 's' : ''}
          </span>
        </div>

        <QuizLaunchBar
          durationSec={activeList.durationSec}
          items={activeList.items}
          focusCount={missStats.length}
          previousBest={previousBest}
          lastScore={lastScore}
          historyTotalFallback={listHistory[0]?.total ?? activeList.items.length}
          onDurationChange={(durationSec) =>
            dispatch(updateJetpunkList(activeList.id, { durationSec }))
          }
          onStartFull={() => {
            setQuizItems(null);
            setQuizOpen(true);
          }}
          onStartFocus={() => {
            setQuizItems(pickFocusItems(activeList.items, missStats));
            setQuizOpen(true);
          }}
        />

        <ListEditor
          items={activeList.items}
          onAddItem={() =>
            dispatch(
              updateJetpunkList(activeList.id, {
                items: [
                  ...activeList.items,
                  { id: createId(), prompt: '', answer: '' },
                ],
              })
            )
          }
          onChangeItem={(id, patch) =>
            dispatch(
              updateJetpunkList(activeList.id, {
                items: activeList.items.map((item) =>
                  item.id === id ? { ...item, ...patch } : item
                ),
              })
            )
          }
          onDeleteItem={(id) =>
            dispatch(
              updateJetpunkList(activeList.id, {
                items: activeList.items.filter((item) => item.id !== id),
              })
            )
          }
        />

        <div className="mt-8 space-y-6">
          <ItemMissStats stats={missStats} />
          <Historique
            entries={listHistory}
            title="Historique de cette liste"
            limit={10}
            hideWhenEmpty
          />
        </div>
      </div>

      {quizOpen ? (
        <QuizRunner
          title={quizItems ? `${activeList.title} — Focus` : activeList.title}
          durationSec={activeList.durationSec}
          items={quizItems ?? activeList.items}
          sourceItems={activeList.items}
          previousBest={previousBest}
          recentAttempts={listHistory}
          onFinish={handleQuizFinish}
          onClose={() => {
            setQuizOpen(false);
            setQuizItems(null);
          }}
        />
      ) : null}

      {!quizOpen ? <JetpunkHelp /> : null}
    </div>
  );
}
