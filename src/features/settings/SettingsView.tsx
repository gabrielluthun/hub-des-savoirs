import { toast } from 'sonner';
import { Button, Input, Label, Select } from '@/components/ui/primitives';
import { GEMINI_MODELS } from '@/types';
import type { GeminiModel, ThemeMode } from '@/types';
import { updateSettings } from '@/store/actions';
import { useStore } from '@/store/StoreProvider';

export function SettingsView() {
  const { state, dispatch } = useStore();
  const { settings } = state;

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Configuration
          </p>
          <h1 className="font-display text-2xl font-semibold">Paramètres</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Clé API, modèle Gemini, thème et modules — tout reste en local.
          </p>
        </div>

        <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-semibold">Gemini</h2>
          <div className="space-y-1.5">
            <Label>Clé API Gemini</Label>
            <Input
              type="password"
              autoComplete="off"
              value={settings.apiKey}
              onChange={(e) => dispatch(updateSettings({ apiKey: e.target.value }))}
              placeholder="AIza…"
            />
            <p className="text-xs text-muted-foreground">
              Stockée uniquement dans localStorage (`gk-hub-state-v1`).
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>Modèle</Label>
            <Select
              value={settings.model}
              onChange={(e) =>
                dispatch(updateSettings({ model: e.target.value as GeminiModel }))
              }
            >
              {GEMINI_MODELS.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </Select>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              if (!settings.apiKey.trim()) {
                toast.error('Saisissez une clé API.');
                return;
              }
              toast.success('Clé API enregistrée localement.');
            }}
          >
            Vérifier l&apos;enregistrement
          </Button>
        </section>

        <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-semibold">Apparence</h2>
          <div className="space-y-1.5">
            <Label>Thème</Label>
            <Select
              value={settings.theme}
              onChange={(e) =>
                dispatch(updateSettings({ theme: e.target.value as ThemeMode }))
              }
            >
              <option value="dark">Sombre</option>
              <option value="light">Clair</option>
            </Select>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-semibold">Modules</h2>
          <label className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Activer l&apos;intégration Quizypedia</p>
              <p className="text-xs text-muted-foreground">
                Affiche ou masque le module dans la navigation.
              </p>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4 accent-[hsl(var(--quiz-accent))]"
              checked={settings.quizypediaEnabled}
              onChange={(e) =>
                dispatch(updateSettings({ quizypediaEnabled: e.target.checked }))
              }
            />
          </label>
        </section>

        <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-semibold">Audio</h2>
          <label className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Effets sonores (Plateau)</p>
              <p className="text-xs text-muted-foreground">
                Bips courts après une bonne ou mauvaise réponse.
              </p>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4 accent-[hsl(var(--quiz-accent))]"
              checked={settings.soundEnabled}
              onChange={(e) =>
                dispatch(updateSettings({ soundEnabled: e.target.checked }))
              }
            />
          </label>
        </section>
      </div>
    </div>
  );
}
