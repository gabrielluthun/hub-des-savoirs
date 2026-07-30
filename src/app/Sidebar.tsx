import { useState } from 'react';
import {
  BookOpen,
  CircleHelp,
  Layers,
  ListChecks,
  HelpCircle,
  MonitorPlay,
  Settings,
  X,
} from 'lucide-react';
import { HubHelpDialog } from '@/app/components/HubHelpDialog';
import { SidebarToday } from '@/app/components/SidebarToday';
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

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const { state, dispatch } = useStore();
  const activeTab = state.settings.activeTab;
  const [helpOpen, setHelpOpen] = useState(false);
  const navItems = NAV_ITEMS.filter(
    (item) => item.id !== 'quizypedia' || state.settings.quizypediaEnabled
  );

  const go = (tab: TabId) => {
    dispatch(setTab(tab));
    onMobileClose?.();
  };

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          aria-label="Fermer le menu"
          onClick={onMobileClose}
        />
      ) : null}

      <aside
        className={cn(
          'flex h-full w-[240px] shrink-0 flex-col border-r border-border bg-background',
          'fixed inset-y-0 left-0 z-50 transition-transform duration-200 md:static md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex items-center gap-3 px-4 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-sm font-semibold leading-tight">Hub du Savoir</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Version locale
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary md:hidden"
            onClick={onMobileClose}
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-2">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Navigation
          </p>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => go(item.id)}
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

        <div className="mt-auto space-y-3 border-t border-border p-3">
          <SidebarToday onNavigate={onMobileClose} />

          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => go('settings')}
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
            <button
              type="button"
              onClick={() => {
                setHelpOpen(true);
                onMobileClose?.();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
            >
              <CircleHelp className="h-4 w-4" />
              <span className="font-medium">Aide</span>
            </button>
          </div>
        </div>
      </aside>

      <HubHelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
