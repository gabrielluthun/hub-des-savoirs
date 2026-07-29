import type { AppAction, AppState } from '@/types';

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;
    case 'SET_TAB':
      return { ...state, settings: { ...state.settings, activeTab: action.tab } };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.patch } };
    case 'ADD_DOC':
      return {
        ...state,
        docs: [action.doc, ...state.docs],
        activeDocId: action.doc.id,
      };
    case 'UPDATE_DOC':
      return {
        ...state,
        docs: state.docs.map((doc) =>
          doc.id === action.id
            ? { ...doc, ...action.patch, updatedAt: new Date().toISOString() }
            : doc
        ),
      };
    case 'DELETE_DOC': {
      const docs = state.docs.filter((doc) => doc.id !== action.id);
      const activeDocId =
        state.activeDocId === action.id ? docs[0]?.id ?? null : state.activeDocId;
      return { ...state, docs, activeDocId };
    }
    case 'SET_ACTIVE_DOC':
      return { ...state, activeDocId: action.id };
    case 'ADD_ANKI_CARD':
      return { ...state, ankiCards: [action.card, ...state.ankiCards] };
    case 'ADD_ANKI_CARDS':
      return { ...state, ankiCards: [...action.cards, ...state.ankiCards] };
    case 'UPDATE_ANKI_CARD':
      return {
        ...state,
        ankiCards: state.ankiCards.map((card) =>
          card.id === action.id ? { ...card, ...action.patch } : card
        ),
      };
    case 'DELETE_ANKI_CARD':
      return {
        ...state,
        ankiCards: state.ankiCards.filter((card) => card.id !== action.id),
      };
    case 'ADD_JETPUNK_LIST':
      return {
        ...state,
        jetpunkLists: [action.list, ...state.jetpunkLists],
        activeJetpunkListId: action.list.id,
      };
    case 'UPDATE_JETPUNK_LIST':
      return {
        ...state,
        jetpunkLists: state.jetpunkLists.map((list) =>
          list.id === action.id ? { ...list, ...action.patch } : list
        ),
      };
    case 'DELETE_JETPUNK_LIST': {
      const jetpunkLists = state.jetpunkLists.filter((list) => list.id !== action.id);
      const activeJetpunkListId =
        state.activeJetpunkListId === action.id
          ? jetpunkLists[0]?.id ?? null
          : state.activeJetpunkListId;
      return { ...state, jetpunkLists, activeJetpunkListId };
    }
    case 'SET_ACTIVE_JETPUNK_LIST':
      return { ...state, activeJetpunkListId: action.id };
    case 'ADD_JETPUNK_HISTORY':
      return {
        ...state,
        jetpunkHistory: [action.entry, ...(state.jetpunkHistory ?? [])].slice(0, 100),
      };
    case 'ADD_GAME_HISTORY':
      return {
        ...state,
        gameHistory: [action.entry, ...state.gameHistory].slice(0, 50),
      };
    default:
      return state;
  }
}
