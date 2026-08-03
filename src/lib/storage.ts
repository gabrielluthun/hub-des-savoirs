import type { AppState } from '@/types';
import { DEFAULT_GEMINI_MODEL } from '@/types';
import { createId } from '@/lib/utils';
import { migrateState } from '@/store/migration';

export const STORAGE_KEY = 'gk-hub-state-v1';

export function createDefaultState(): AppState {
  const docId = createId();
  const now = new Date().toISOString();

  return {
    settings: {
      apiKey: '',
      model: DEFAULT_GEMINI_MODEL,
      theme: 'dark',
      quizypediaEnabled: false,
      soundEnabled: false,
      activeTab: 'docs',
    },
    docs: [
      {
        id: docId,
        title: 'Quizypédia',
        googleDocsUrl: '',
        content: '# Titre\n- Point 1\n- Point 2\n',
        tags: [],
        updatedAt: now,
      },
      {
        id: createId(),
        title: 'Nouveau document',
        googleDocsUrl: '',
        content: '',
        tags: [],
        updatedAt: now,
      },
    ],
    activeDocId: docId,
    ankiCards: [],
    ankiDecks: [],
    jetpunkLists: [],
    activeJetpunkListId: null,
    jetpunkHistory: [],
    gameHistory: [],
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const defaults = createDefaultState();
    return migrateState({
      ...defaults,
      ...parsed,
      settings: { ...defaults.settings, ...parsed.settings },
      jetpunkHistory: parsed.jetpunkHistory ?? [],
      gameHistory: parsed.gameHistory ?? [],
    });
  } catch {
    return createDefaultState();
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
