import type { AppState, HubDocument, JetPunkList } from '@/types';

export const selectSettings = (state: AppState) => state.settings;
export const selectActiveTab = (state: AppState) => state.settings.activeTab;
export const selectDocs = (state: AppState) => state.docs;
export const selectActiveDoc = (state: AppState): HubDocument | null =>
  state.docs.find((doc) => doc.id === state.activeDocId) ?? null;
export const selectAnkiCards = (state: AppState) => state.ankiCards;
export const selectAnkiDecks = (state: AppState) => state.ankiDecks ?? [];
export const selectJetpunkLists = (state: AppState) => state.jetpunkLists;
export const selectActiveJetpunkList = (state: AppState): JetPunkList | null =>
  state.jetpunkLists.find((list) => list.id === state.activeJetpunkListId) ?? null;
export const selectJetpunkHistory = (state: AppState) => state.jetpunkHistory ?? [];
export const selectGameHistory = (state: AppState) => state.gameHistory;
