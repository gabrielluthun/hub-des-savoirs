import { Lock, CircleHelp } from 'lucide-react';
import { useStore } from '@/store/StoreProvider';
import { setTab } from '@/store/actions';
import { Button } from '@/components/ui/primitives';

export function QuizypediaView() {
  const { state, dispatch } = useStore();
  const enabled = state.settings.quizypediaEnabled;

  if (!enabled) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card px-8 py-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
            <Lock className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Module désactivé
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold">Bientôt disponible</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            L&apos;intégration Quizypedia est prête mais désactivée. Activez-la dans les Paramètres
            → Modules dès qu&apos;elle sera approuvée.
          </p>
          <Button
            type="button"
            variant="secondary"
            className="mt-6"
            onClick={() => dispatch(setTab('settings'))}
          >
            Ouvrir les Paramètres
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Module actif
        </p>
        <h1 className="font-display text-2xl font-semibold">Quizypedia</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          L&apos;intégration est activée. Branchez l&apos;API dès qu&apos;elle sera disponible.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border">
        <div className="max-w-sm px-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
            <CircleHelp className="h-5 w-5 text-muted-foreground" />
          </div>
          <h2 className="font-display text-lg font-semibold">Prêt pour l&apos;API</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Aucune source Quizypedia configurée pour le moment. Ce module attend l&apos;accès
            développeur / l&apos;approbation API.
          </p>
        </div>
      </div>
    </div>
  );
}
