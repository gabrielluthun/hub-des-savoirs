import { getDueCards } from '@/features/anki/lib/srs/schedule';
import type { AppState, JetPunkHistoryEntry, JetPunkList } from '@/types';

function isSameLocalDay(iso: string, now: Date): boolean {
  const date = new Date(iso);
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

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

export function hasJetpunkPlayToday(state: AppState, now = new Date()): boolean {
  return (state.jetpunkHistory ?? []).some((entry) => isSameLocalDay(entry.playedAt, now));
}

export function hasPlateauPlayToday(state: AppState, now = new Date()): boolean {
  return (state.gameHistory ?? []).some((entry) => isSameLocalDay(entry.playedAt, now));
}

export function hasPlateauHistory(state: AppState): boolean {
  return (state.gameHistory ?? []).length > 0;
}
