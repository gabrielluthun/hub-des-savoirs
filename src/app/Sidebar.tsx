import {
  BookOpen,
  Layers,
  ListChecks,
  HelpCircle,
  MonitorPlay,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/primitives';
import { useStore } from '@/store/StoreProvider';
import { setTab } from '@/store/actions';
import type { TabId } from '@/types';

const NAV_ITEMS: {
  id: TabId;
  label: string;
  icon: typeof BookOpen;
  badge?: string;
}[] = [
  { id: 'docs', label: 'Google Docs', icon: BookOpen },
  { id: 'anki', label: 'Anki', icon: Layers },
  { id: 'jetpunk', label: 'JetPunk', icon: ListChecks },
  { id: 'quizypedia', label: 'Quizypedia', icon: HelpCircle },
  { id: 'plateau', label: 'Plateau', icon: MonitorPlay, badge: 'IA' },
];

export function Sidebar() {
  const { state, dispatch } = useStore();
  const activeTab = state.settings.activeTab;

  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-r border-border bg-background">
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <BookOpen className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold leading-tight">Hub du Savoir</p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Version locale
          </p>
        </div>
      </div>

      <div className="px-3 pb-2">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Navigation
        </p>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => dispatch(setTab(item.id))}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                  active
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 font-medium">{item.label}</span>
                {item.badge ? <Badge>{item.badge}</Badge> : null}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-border p-3">
        <button
          type="button"
          onClick={() => dispatch(setTab('settings'))}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
            activeTab === 'settings'
              ? 'bg-secondary text-foreground'
              : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
          )}
        >
          <Settings className="h-4 w-4" />
          <span className="font-medium">Paramètres</span>
        </button>
      </div>
    </aside>
  );
}
