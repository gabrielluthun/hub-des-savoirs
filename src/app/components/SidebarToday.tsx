import { Layers, ListChecks, MonitorPlay } from 'lucide-react';
import {
  countDueAnkiCards,
  findLastJetpunkPlay,
  hasPlateauHistory,
} from '@/app/lib/today';
import { requestNavIntent } from '@/app/nav-intent';
import { setActiveJetpunkList, setTab } from '@/store/actions';
import { useStore } from '@/store/StoreProvider';
import type { TabId } from '@/types';

interface SidebarTodayProps {
  onNavigate?: () => void;
}

export function SidebarToday({ onNavigate }: SidebarTodayProps) {
  const { state, dispatch } = useStore();
  const dueCount = countDueAnkiCards(state);
  const lastJetpunk = findLastJetpunkPlay(state);
  const showPlateau = hasPlateauHistory(state);

  const go = (tab: TabId) => {
    dispatch(setTab(tab));
    onNavigate?.();
  };

  const startAnkiReview = () => {
    requestNavIntent('anki-review');
    go('anki');
  };

  const resumeJetpunk = () => {
    if (!lastJetpunk) return;
    if (lastJetpunk.list) {
      dispatch(setActiveJetpunkList(lastJetpunk.list.id));
    }
    go('jetpunk');
  };

  const empty = dueCount === 0 && !lastJetpunk && !showPlateau;

  return (
    <div className="rounded-xl bg-secondary/40 px-3 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Aujourd’hui
      </p>

      {empty ? (
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Rien de prévu — choisis un module pour commencer.
        </p>
      ) : (
        <ul className="mt-2 flex flex-col gap-1">
          {dueCount > 0 ? (
            <li>
              <button
                type="button"
                onClick={startAnkiReview}
                className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1.5 text-left text-xs transition-colors hover:bg-secondary"
              >
                <Layers className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate text-foreground">
                  Anki · {dueCount} à réviser
                </span>
                <span className="shrink-0 font-medium text-foreground">Réviser</span>
              </button>
            </li>
          ) : null}

          {lastJetpunk ? (
            <li>
              <button
                type="button"
                onClick={resumeJetpunk}
                className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1.5 text-left text-xs transition-colors hover:bg-secondary"
              >
                <ListChecks className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate text-foreground">
                  {lastJetpunk.entry.listTitle}
                </span>
                <span className="shrink-0 font-medium text-foreground">Reprendre</span>
              </button>
            </li>
          ) : null}

          {showPlateau ? (
            <li>
              <button
                type="button"
                onClick={() => go('plateau')}
                className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1.5 text-left text-xs transition-colors hover:bg-secondary"
              >
                <MonitorPlay className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate text-foreground">
                  Plateau · nouveau quiz
                </span>
                <span className="shrink-0 font-medium text-foreground">Lancer</span>
              </button>
            </li>
          ) : null}
        </ul>
      )}
    </div>
  );
}
