import { isTauriRuntime } from '@/lib/utils';

export type UpdateCheckResult =
  | { status: 'unavailable' }
  | { status: 'up-to-date' }
  | { status: 'available'; version: string; notes: string | null; date: string | null }
  | { status: 'error'; message: string };

export async function checkForAppUpdate(): Promise<UpdateCheckResult> {
  if (!isTauriRuntime()) {
    return { status: 'unavailable' };
  }

  try {
    const { check } = await import('@tauri-apps/plugin-updater');
    const update = await check();
    if (!update) {
      return { status: 'up-to-date' };
    }
    return {
      status: 'available',
      version: update.version,
      notes: update.body ?? null,
      date: update.date ?? null,
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Vérification impossible.',
    };
  }
}

export async function downloadAndInstallAppUpdate(): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!isTauriRuntime()) {
    return { ok: false, message: 'Mises à jour disponibles uniquement dans l’app desktop.' };
  }

  try {
    const { check } = await import('@tauri-apps/plugin-updater');
    const { relaunch } = await import('@tauri-apps/plugin-process');
    const update = await check();
    if (!update) {
      return { ok: false, message: 'Aucune mise à jour à installer.' };
    }
    await update.downloadAndInstall();
    await relaunch();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Installation impossible.',
    };
  }
}
