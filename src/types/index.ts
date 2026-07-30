export type TabId =
  | 'docs'
  | 'anki'
  | 'jetpunk'
  | 'quizypedia'
  | 'plateau'
  | 'settings';

export type ThemeMode = 'dark' | 'light';

export type GeminiModel =
  | 'gemini-3.5-flash-lite'
  | 'gemini-3.5-flash'
  | 'gemini-3.6-flash'
  | 'gemini-3.1-pro';

export const GEMINI_MODELS: GeminiModel[] = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.1-pro',
];

export const DEFAULT_GEMINI_MODEL: GeminiModel = 'gemini-3.5-flash-lite';

export type Difficulty = 'facile' | 'moyen' | 'difficile' | 'expert';

export type QuizSource = 'all' | 'docs' | 'anki' | 'jetpunk';

/** Fine-grained Plateau source picks. Fine lists apply when kind ≠ 'all'. */
export interface QuizSourceSelection {
  kind: QuizSource;
  /** Document ids when kind === 'docs'. */
  docIds: string[];
  /** Deck names when kind === 'anki'. */
  deckNames: string[];
  /** JetPunk list ids when kind === 'jetpunk'. */
  listIds: string[];
}

export interface AppSettings {
  apiKey: string;
  model: GeminiModel;
  theme: ThemeMode;
  quizypediaEnabled: boolean;
  soundEnabled: boolean;
  activeTab: TabId;
}

export interface HubDocument {
  id: string;
  title: string;
  googleDocsUrl: string;
  content: string;
  /** Flat multi-tags for sidebar filter and Plateau source picking */
  tags: string[];
  /** SHA-256 of the last successfully imported Google Docs content */
  contentHash?: string;
  lastImportedAt?: string;
  updatedAt: string;
}

export interface AnkiCard {
  id: string;
  question: string;
  answer: string;
  /** Optional mnemonic / memory aid */
  mnemonic: string;
  /** Deck name for grouping / Plateau targeting */
  deck: string;
  /** Flat multi-tags for filtering and Plateau targeting */
  tags: string[];
  /** ISO datetime — card is due when dueAt <= now */
  dueAt: string;
  /** Current SRS interval in days (0 = learning / just failed) */
  intervalDays: number;
  /** Successful review count */
  reps: number;
}

export interface JetPunkItem {
  id: string;
  prompt: string;
  answer: string;
}

export interface JetPunkList {
  id: string;
  title: string;
  category: string;
  durationSec: number;
  items: JetPunkItem[];
}

export interface GameHistoryEntry {
  id: string;
  score: number;
  total: number;
  difficulty: Difficulty;
  playedAt: string;
}

export interface JetPunkHistoryEntry {
  id: string;
  listId: string;
  listTitle: string;
  score: number;
  total: number;
  durationSec: number;
  elapsedSec: number;
  playedAt: string;
  /** Item ids found during the attempt — absent on legacy entries. */
  foundIds?: string[];
}

export type QuestionType = 'qcm' | 'libre' | 'vrai_faux' | 'liste';

export interface GeneratedQuestion {
  type: QuestionType;
  question: string;
  /** QCM / vrai-faux choices. */
  options?: string[];
  /** Canonical answer (also used for libre / vrai-faux). */
  answer: string;
  /** For type liste: items the player must find. */
  answers?: string[];
  explanation: string;
}

export interface AppState {
  settings: AppSettings;
  docs: HubDocument[];
  activeDocId: string | null;
  ankiCards: AnkiCard[];
  ankiDecks: string[];
  jetpunkLists: JetPunkList[];
  activeJetpunkListId: string | null;
  jetpunkHistory: JetPunkHistoryEntry[];
  gameHistory: GameHistoryEntry[];
}

export type AppAction =
  | { type: 'SET_TAB'; tab: TabId }
  | { type: 'UPDATE_SETTINGS'; patch: Partial<AppSettings> }
  | { type: 'ADD_DOC'; doc: HubDocument }
  | { type: 'UPDATE_DOC'; id: string; patch: Partial<HubDocument> }
  | { type: 'DELETE_DOC'; id: string }
  | { type: 'SET_ACTIVE_DOC'; id: string | null }
  | { type: 'ADD_ANKI_CARD'; card: AnkiCard }
  | { type: 'ADD_ANKI_CARDS'; cards: AnkiCard[] }
  | { type: 'UPDATE_ANKI_CARD'; id: string; patch: Partial<AnkiCard> }
  | { type: 'DELETE_ANKI_CARD'; id: string }
  | { type: 'ADD_ANKI_DECK'; name: string }
  | { type: 'REMOVE_ANKI_DECK'; name: string }
  | { type: 'ADD_JETPUNK_LIST'; list: JetPunkList }
  | { type: 'UPDATE_JETPUNK_LIST'; id: string; patch: Partial<JetPunkList> }
  | { type: 'DELETE_JETPUNK_LIST'; id: string }
  | { type: 'SET_ACTIVE_JETPUNK_LIST'; id: string | null }
  | { type: 'ADD_JETPUNK_HISTORY'; entry: JetPunkHistoryEntry }
  | { type: 'ADD_GAME_HISTORY'; entry: GameHistoryEntry }
  | { type: 'HYDRATE'; state: AppState };
