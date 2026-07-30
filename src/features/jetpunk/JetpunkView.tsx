import { useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Historique } from '@/features/jetpunk/Historique';
import { ItemMissStats } from '@/features/jetpunk/components/ItemMissStats';
import { QuizLaunchBar } from '@/features/jetpunk/components/QuizLaunchBar';
import { ListEditor } from '@/features/jetpunk/ListEditor';
import { ListSidebar } from '@/features/jetpunk/ListSidebar';
import { QuizRunner } from '@/features/jetpunk/QuizRunner';
import type { QuizResult } from '@/features/jetpunk/Stats';
import {
  computeItemMissStats,
  pickFocusItems,
} from '@/features/jetpunk/lib/item-stats';
import { Input } from '@/components/ui/primitives';
import { createId } from '@/lib/utils';
import type { JetPunkItem } from '@/types';
import {
  addJetpunkHistory,
  addJetpunkList,
  deleteJetpunkList,
  setActiveJetpunkList,
  updateJetpunkList,
} from '@/store/actions';
import { useStore } from '@/store/StoreProvider';
import {
  selectActiveJetpunkList,
  selectJetpunkHistory,
  selectJetpunkLists,
} from '@/store/selectors';

export function JetPunkView() {
  const { state, dispatch } = useStore();
  const lists = selectJetpunkLists(state);
  const activeList = selectActiveJetpunkList(state);
  const history = selectJetpunkHistory(state) ?? [];
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizItems, setQuizItems] = useState<JetPunkItem[] | null>(null);

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
        title: 'Nouvelle liste',
        category: 'Général',
        durationSec: 90,
        items: [{ id: createId(), prompt: '', answer: '' }],
      })
    );
  };

  if (!activeList) {
    return (
      <div className="flex h-full">
        <ListSidebar
          lists={lists}
          activeListId={null}
          onSelect={(id) => dispatch(setActiveJetpunkList(id))}
          onAdd={handleAddList}
        />
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Aucune liste sélectionnée.
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col md:flex-row">
      <ListSidebar
        lists={lists}
        activeListId={activeList.id}
        onSelect={(id) => dispatch(setActiveJetpunkList(id))}
        onAdd={handleAddList}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <input
            value={activeList.title}
            onChange={(e) =>
              dispatch(updateJetpunkList(activeList.id, { title: e.target.value }))
            }
            className="w-full bg-transparent font-display text-2xl font-semibold outline-none"
          />
          <button
            type="button"
            onClick={() => {
              dispatch(deleteJetpunkList(activeList.id));
              toast.success('Liste supprimée.');
            }}
            className="rounded-lg p-2 text-destructive hover:bg-destructive/10"
            aria-label="Supprimer la liste"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Input
            value={activeList.category}
            onChange={(e) =>
              dispatch(updateJetpunkList(activeList.id, { category: e.target.value }))
            }
            className="h-8 w-auto rounded-full px-3 text-xs"
          />
          <span className="text-xs text-muted-foreground">
            {activeList.items.length} élément{activeList.items.length !== 1 ? 's' : ''}
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
    </div>
  );
}
