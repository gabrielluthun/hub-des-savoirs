import { isTauriRuntime } from '@/lib/utils';

export interface ConfirmOptions {
  title?: string;
  okLabel?: string;
  cancelLabel?: string;
}

/**
 * Confirm dialog that works in the browser (`window.confirm`)
 * and in the Tauri desktop shell (native dialog plugin).
 */
export async function confirmAction(
  message: string,
  options: ConfirmOptions = {}
): Promise<boolean> {
  if (isTauriRuntime()) {
    const { confirm } = await import('@tauri-apps/plugin-dialog');
    return confirm(message, {
      title: options.title ?? 'Hub des Savoirs',
      kind: 'warning',
      okLabel: options.okLabel ?? 'OK',
      cancelLabel: options.cancelLabel ?? 'Annuler',
    });
  }

  return window.confirm(message);
}
