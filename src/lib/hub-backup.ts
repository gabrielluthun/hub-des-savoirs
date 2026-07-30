import { createDefaultState } from '@/lib/storage';
import { migrateState } from '@/store/migration';
import type { AppState } from '@/types';

export const HUB_BACKUP_FORMAT = 'hub-du-savoir-backup' as const;
export const HUB_BACKUP_VERSION = 1;

export interface HubBackupFile {
  format: typeof HUB_BACKUP_FORMAT;
  version: number;
  exportedAt: string;
  state: AppState;
}

export function buildHubBackup(state: AppState): HubBackupFile {
  return {
    format: HUB_BACKUP_FORMAT,
    version: HUB_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    state,
  };
}

export function serializeHubBackup(state: AppState): string {
  return `${JSON.stringify(buildHubBackup(state), null, 2)}\n`;
}

export function parseHubBackup(raw: string): AppState {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Fichier JSON invalide.');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Sauvegarde Hub invalide.');
  }

  const file = parsed as Partial<HubBackupFile> & { state?: Partial<AppState> };

  // Accept wrapped backup or a raw AppState snapshot for flexibility.
  const candidate =
    file.format === HUB_BACKUP_FORMAT && file.state && typeof file.state === 'object'
      ? file.state
      : looksLikeAppState(parsed)
        ? (parsed as Partial<AppState>)
        : null;

  if (!candidate) {
    throw new Error(
      'Ce fichier n’est pas une sauvegarde Hub du Savoir.'
    );
  }

  const defaults = createDefaultState();
  return migrateState({
    ...defaults,
    ...candidate,
    settings: { ...defaults.settings, ...candidate.settings },
    docs: candidate.docs ?? defaults.docs,
    ankiCards: candidate.ankiCards ?? defaults.ankiCards,
    ankiDecks: candidate.ankiDecks ?? defaults.ankiDecks,
    jetpunkLists: candidate.jetpunkLists ?? defaults.jetpunkLists,
    jetpunkHistory: candidate.jetpunkHistory ?? [],
    gameHistory: candidate.gameHistory ?? [],
    activeDocId: candidate.activeDocId ?? defaults.activeDocId,
    activeJetpunkListId:
      candidate.activeJetpunkListId ?? defaults.activeJetpunkListId,
  });
}

function looksLikeAppState(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.settings === 'object' &&
    obj.settings !== null &&
    Array.isArray(obj.docs) &&
    Array.isArray(obj.ankiCards) &&
    Array.isArray(obj.jetpunkLists)
  );
}
