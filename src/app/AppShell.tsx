import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from '@/app/Sidebar';
import { AnkiView } from '@/features/anki/AnkiView';
import { DocsView } from '@/features/docs/DocsView';
import { JetPunkView } from '@/features/jetpunk/JetpunkView';
import { PlateauView } from '@/features/plateau/PlateauView';
import { QuizypediaView } from '@/features/quizypedia/QuizypediaView';
import { SettingsView } from '@/features/settings/SettingsView';
import { setTab } from '@/store/actions';
import { useStore } from '@/store/StoreProvider';

export function AppShell() {
  const { state, dispatch } = useStore();
  const tab = state.settings.activeTab;
  const quizypediaEnabled = state.settings.quizypediaEnabled;
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (tab === 'quizypedia' && !quizypediaEnabled) {
      dispatch(setTab('settings'));
    }
  }, [tab, quizypediaEnabled, dispatch]);

  return (
    <div className="flex h-full min-h-0 bg-background text-foreground">
      <Sidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex items-center gap-3 border-b border-border px-3 py-2 md:hidden">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <p className="font-display text-sm font-semibold">Hub des Savoirs</p>
        </header>
        <main className="min-h-0 min-w-0 flex-1 overflow-hidden">
          {tab === 'docs' && <DocsView />}
          {tab === 'anki' && <AnkiView />}
          {tab === 'jetpunk' && <JetPunkView />}
          {tab === 'quizypedia' && quizypediaEnabled && <QuizypediaView />}
          {tab === 'plateau' && <PlateauView />}
          {tab === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
}
