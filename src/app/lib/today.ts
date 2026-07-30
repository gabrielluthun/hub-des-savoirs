import { getDueCards } from '@/features/anki/lib/srs/schedule';
import type { AppState, JetPunkHistoryEntry, JetPunkList } from '@/types';

export function countDueAnkiCards(state: AppState, now = new Date()): number {
  return getDueCards(state.ankiCards, now).length;
}

export function findLastJetpunkPlay(state: AppState): {
  entry: JetPunkHistoryEntry;
  list: JetPunkList | null;
} | null {
  const history = state.jetpunkHistory ?? [];
  const entry = history[0];
  if (!entry) return null;
  const list = state.jetpunkLists.find((item) => item.id === entry.listId) ?? null;
  return { entry, list };
}

export function hasPlateauHistory(state: AppState): boolean {
  return (state.gameHistory ?? []).length > 0;
}
