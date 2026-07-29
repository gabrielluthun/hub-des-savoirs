import { Sidebar } from '@/app/Sidebar';
import { AnkiView } from '@/features/anki/AnkiView';
import { DocsView } from '@/features/docs/DocsView';
import { JetPunkView } from '@/features/jetpunk/JetPunkView';
import { PlateauView } from '@/features/plateau/PlateauView';
import { QuizypediaView } from '@/features/quizypedia/QuizypediaView';
import { useStore } from '@/store/StoreProvider';

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex h-full flex-1 items-center justify-center p-8">
      <p className="text-sm text-muted-foreground">{title} — en cours de chargement…</p>
    </div>
  );
}

export function AppShell() {
  const { state } = useStore();
  const tab = state.settings.activeTab;

  return (
    <div className="flex h-full min-h-0 bg-background text-foreground">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-hidden">
        {tab === 'docs' && <DocsView />}
        {tab === 'anki' && <AnkiView />}
        {tab === 'jetpunk' && <JetPunkView />}
        {tab === 'quizypedia' && <QuizypediaView />}
        {tab === 'plateau' && <PlateauView />}
        {tab === 'settings' && <Placeholder title="Paramètres" />}
      </main>
    </div>
  );
}
