import type {
  AnkiCard,
  AppSettings,
  Difficulty,
  HubDocument,
  JetPunkList,
  PlayedQuizFact,
  TabId,
} from '@/types';

export const setTab = (tab: TabId) => ({ type: 'SET_TAB' as const, tab });

export const updateSettings = (patch: Partial<AppSettings>) => ({
  type: 'UPDATE_SETTINGS' as const,
  patch,
});

export const addDoc = (doc: HubDocument) => ({ type: 'ADD_DOC' as const, doc });

export const updateDoc = (id: string, patch: Partial<HubDocument>) => ({
  type: 'UPDATE_DOC' as const,
  id,
  patch,
});

export const deleteDoc = (id: string) => ({ type: 'DELETE_DOC' as const, id });

export const setActiveDoc = (id: string | null) => ({
  type: 'SET_ACTIVE_DOC' as const,
  id,
});

export const addAnkiCard = (card: AnkiCard) => ({
  type: 'ADD_ANKI_CARD' as const,
  card,
});

export const addAnkiCards = (cards: AnkiCard[]) => ({
  type: 'ADD_ANKI_CARDS' as const,
  cards,
});

export const updateAnkiCard = (id: string, patch: Partial<AnkiCard>) => ({
  type: 'UPDATE_ANKI_CARD' as const,
  id,
  patch,
});

export const deleteAnkiCard = (id: string) => ({
  type: 'DELETE_ANKI_CARD' as const,
  id,
});

export const addAnkiDeck = (name: string) => ({
  type: 'ADD_ANKI_DECK' as const,
  name,
});

export const removeAnkiDeck = (name: string) => ({
  type: 'REMOVE_ANKI_DECK' as const,
  name,
});

export const addJetpunkList = (list: JetPunkList) => ({
  type: 'ADD_JETPUNK_LIST' as const,
  list,
});

export const updateJetpunkList = (id: string, patch: Partial<JetPunkList>) => ({
  type: 'UPDATE_JETPUNK_LIST' as const,
  id,
  patch,
});

export const deleteJetpunkList = (id: string) => ({
  type: 'DELETE_JETPUNK_LIST' as const,
  id,
});

export const setActiveJetpunkList = (id: string | null) => ({
  type: 'SET_ACTIVE_JETPUNK_LIST' as const,
  id,
});

export const addJetpunkHistory = (entry: {
  id: string;
  listId: string;
  listTitle: string;
  score: number;
  total: number;
  durationSec: number;
  elapsedSec: number;
  playedAt: string;
  foundIds?: string[];
}) => ({ type: 'ADD_JETPUNK_HISTORY' as const, entry });

export const addGameHistory = (entry: {
  id: string;
  score: number;
  total: number;
  difficulty: Difficulty;
  playedAt: string;
  questions?: PlayedQuizFact[];
}) => ({ type: 'ADD_GAME_HISTORY' as const, entry });
