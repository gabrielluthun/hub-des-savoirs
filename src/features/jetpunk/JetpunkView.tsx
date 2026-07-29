import { useMemo, useState } from 'react';
import { Play, Target, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Historique } from '@/features/jetpunk/Historique';
import { ListEditor } from '@/features/jetpunk/ListEditor';
import { ListSidebar } from '@/features/jetpunk/ListSidebar';
import { QuizRunner } from '@/features/jetpunk/QuizRunner';
import type { QuizResult } from '@/features/jetpunk/Stats';
import { Button, Input, Select } from '@/components/ui/primitives';
import { createId } from '@/lib/utils';
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

const DURATION_OPTIONS = [
  { label: '1 min', value: 60 },
  { label: '1 min 30', value: 90 },
  { label: '2 min', value: 120 },
  { label: '3 min', value: 180 },
  { label: '5 min', value: 300 },
];

export function JetPunkView() {
  const { state, dispatch } = useStore();
  const lists = selectJetpunkLists(state);
  const activeList = selectActiveJetpunkList(state);
  const history = selectJetpunkHistory(state) ?? [];
  const [quizOpen, setQuizOpen] = useState(false);

  const listHistory = useMemo(() => {
    if (!activeList) return [];
    return history.filter((entry) => entry.listId === activeList.id);
  }, [activeList, history]);
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

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Durée</span>
            <Select
              value={String(activeList.durationSec)}
              onChange={(e) =>
                dispatch(
                  updateJetpunkList(activeList.id, {
                    durationSec: Number(e.target.value),
                  })
                )
              }
              className="h-9 w-[130px]"
            >
              {DURATION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <Button
            type="button"
            onClick={() => {
              if (activeList.items.filter((item) => item.answer.trim()).length === 0) {
                toast.error('Ajoutez au moins une réponse.');
                return;
              }
              setQuizOpen(true);
            }}
          >
            <Play className="h-4 w-4" />
            Démarrer le quiz
          </Button>
          <div className="ml-auto flex items-center gap-3 text-sm text-muted-foreground">
            {previousBest !== null ? (
              <span className="tabular-nums">
                Record {previousBest}/
                {listHistory[0]?.total ?? activeList.items.length}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-2 tabular-nums">
              <Target className="h-4 w-4" />
              {lastScore} / {activeList.items.filter((item) => item.answer.trim()).length}
            </span>
          </div>
        </div>

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

        <div className="mt-8">
          <Historique
            entries={listHistory}
            title="Historique de cette liste"
            limit={10}
          />
        </div>
      </div>

      {quizOpen ? (
        <QuizRunner
          title={activeList.title}
          durationSec={activeList.durationSec}
          items={activeList.items}
          previousBest={previousBest}
          recentAttempts={listHistory}
          onFinish={handleQuizFinish}
          onClose={() => setQuizOpen(false)}
        />
      ) : null}
    </div>
  );
}
