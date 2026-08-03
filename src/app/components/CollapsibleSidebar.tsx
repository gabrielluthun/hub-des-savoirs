import { useState } from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
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

const STORAGE_KEY = 'hub-sidebar-collapsed';

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

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

interface CollapsibleSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

/** Desktop sidebar with persistable icon-rail collapse. Mobile drawer unchanged. */
export function CollapsibleSidebar({
  mobileOpen = false,
  onMobileClose,
}: CollapsibleSidebarProps) {
  const { state, dispatch } = useStore();
  const activeTab = state.settings.activeTab;
  const [helpOpen, setHelpOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const navItems = NAV_ITEMS.filter(
    (item) => item.id !== 'quizypedia' || state.settings.quizypediaEnabled
  );

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  };

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
          'flex h-full shrink-0 flex-col border-r border-border bg-background transition-[width] duration-200',
          'fixed inset-y-0 left-0 z-50 md:static md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          collapsed ? 'w-[240px] md:w-[72px]' : 'w-[240px]'
        )}
      >
        <div
          className={cn(
            'flex items-center gap-3 px-4 py-5',
            collapsed && 'md:flex-col md:gap-2 md:px-2'
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <BookOpen className="h-4 w-4" />
          </div>
          <div className={cn('min-w-0 flex-1', collapsed && 'md:hidden')}>
            <p className="font-display text-sm font-semibold leading-tight">Hub des Savoirs</p>
          </div>
          <button
            type="button"
            className="hidden rounded-lg p-1.5 text-muted-foreground hover:bg-secondary md:inline-flex"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Déplier la barre latérale' : 'Replier la barre latérale'}
            aria-expanded={!collapsed}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          <button
            type="button"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary md:hidden"
            onClick={onMobileClose}
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className={cn('min-h-0 flex-1 overflow-y-auto px-3 pb-2', collapsed && 'md:px-2')}>
          <p
            className={cn(
              'mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground',
              collapsed && 'md:hidden'
            )}
          >
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
                  title={item.label}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                    collapsed && 'md:justify-center md:px-0',
                    active
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className={cn('flex-1 font-medium', collapsed && 'md:hidden')}>
                    {item.label}
                  </span>
                  {item.badge ? (
                    <span className={cn(collapsed && 'md:hidden')}>
                      <Badge>{item.badge}</Badge>
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        <div className={cn('mt-auto space-y-3 border-t border-border p-3', collapsed && 'md:p-2')}>
          <div className={cn(collapsed && 'md:hidden')}>
            <SidebarToday onNavigate={onMobileClose} />
          </div>

          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => go('settings')}
              title="Paramètres"
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                collapsed && 'md:justify-center md:px-0',
                activeTab === 'settings'
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
              )}
            >
              <Settings className="h-4 w-4 shrink-0" />
              <span className={cn('font-medium', collapsed && 'md:hidden')}>Paramètres</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setHelpOpen(true);
                onMobileClose?.();
              }}
              title="Aide"
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground',
                collapsed && 'md:justify-center md:px-0'
              )}
            >
              <CircleHelp className="h-4 w-4 shrink-0" />
              <span className={cn('font-medium', collapsed && 'md:hidden')}>Aide</span>
            </button>
          </div>
        </div>
      </aside>

      <HubHelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
