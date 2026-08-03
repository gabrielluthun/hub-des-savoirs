import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { confirmAction } from '@/lib/confirm';
import { downloadJsonFile } from '@/lib/export';
import { verifyGeminiApiKey } from '@/lib/gemini';
import { parseHubBackup, serializeHubBackup } from '@/lib/hub-backup';
import { checkForAppUpdate, downloadAndInstallAppUpdate } from '@/lib/updater';
import { isTauriRuntime } from '@/lib/utils';
import { Button, Input, Label, Select } from '@/components/ui/primitives';
import { GEMINI_MODELS } from '@/types';
import type { GeminiModel, ThemeMode } from '@/types';
import { hydrate, updateSettings } from '@/store/actions';
import { useStore } from '@/store/StoreProvider';

export function SettingsView() {
  const { state, dispatch } = useStore();
  const { settings } = state;
  const [verifying, setVerifying] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [installingUpdate, setInstallingUpdate] = useState(false);
  const backupInputRef = useRef<HTMLInputElement>(null);
  const isDesktop = isTauriRuntime();

  const handleVerifyApiKey = async () => {
    if (!settings.apiKey.trim()) {
      toast.error('Saisissez une clé API.');
      return;
    }
    setVerifying(true);
    try {
      await verifyGeminiApiKey({
        apiKey: settings.apiKey,
        model: settings.model,
      });
      toast.success('Clé API valide — connexion Gemini OK.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Échec de la vérification.');
    } finally {
      setVerifying(false);
    }
  };

  const handleExportBackup = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadJsonFile(`hub-des-savoirs-backup-${stamp}.json`, serializeHubBackup(state));
    toast.success('Sauvegarde exportée (inclut la clé API si renseignée).');
  };

  const handleImportBackup = async (file: File) => {
    try {
      const raw = await file.text();
      const next = parseHubBackup(raw);
      const confirmed = await confirmAction(
        'Remplacer tout le Hub (docs, Anki, JetPunk, historiques, paramètres) par cette sauvegarde ? Cette action est immédiate.',
        { title: 'Restaurer la sauvegarde', okLabel: 'Restaurer' }
      );
      if (!confirmed) return;
      dispatch(hydrate(next));
      toast.success('Sauvegarde restaurée.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Import impossible.');
    }
  };

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    try {
      const result = await checkForAppUpdate();
      if (result.status === 'unavailable') {
        toast.message('Mises à jour disponibles uniquement dans l’app desktop.');
        return;
      }
      if (result.status === 'up-to-date') {
        toast.success('Vous êtes à jour.');
        return;
      }
      if (result.status === 'error') {
        toast.error(result.message);
        return;
      }

      const confirmed = await confirmAction(
        `Une nouvelle version (${result.version}) est disponible. Télécharger et installer maintenant ?`,
        { title: 'Mise à jour disponible', okLabel: 'Installer' }
      );
      if (!confirmed) return;

      setInstallingUpdate(true);
      const install = await downloadAndInstallAppUpdate();
      if (!install.ok) {
        toast.error(install.message);
      }
    } finally {
      setCheckingUpdate(false);
      setInstallingUpdate(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Configuration
          </p>
          <h1 className="font-display text-2xl font-semibold">Paramètres</h1>
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
              placeholder="Insérer la clé API ici"
            />
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
            disabled={verifying}
            onClick={() => {
              void handleVerifyApiKey();
            }}
          >
            {verifying ? 'Vérification…' : 'Vérifier la clé API'}
          </Button>
        </section>

        <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-semibold">Sauvegarde</h2>
          <p className="text-sm text-muted-foreground">
            Exporte ou restaure l’état complet du Hub : docs, cartes, listes, historiques, paramètres.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={handleExportBackup}>
              Exporter la sauvegarde
            </Button>
            <input
              ref={backupInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = '';
                if (file) void handleImportBackup(file);
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => backupInputRef.current?.click()}
            >
              Restaurer une sauvegarde
            </Button>
          </div>
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

        {isDesktop ? (
          <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-semibold">Mises à jour</h2>
            <p className="text-sm text-muted-foreground">
              Vérifie les mises à jour disponibles et propose l’installation.
            </p>
            <Button
              type="button"
              variant="secondary"
              disabled={checkingUpdate || installingUpdate}
              onClick={() => {
                void handleCheckUpdate();
              }}
            >
              {installingUpdate
                ? 'Installation…'
                : checkingUpdate
                  ? 'Vérification…'
                  : 'Vérifier les mises à jour'}
            </Button>
          </section>
        ) : null}
      </div>
    </div>
  );
}
