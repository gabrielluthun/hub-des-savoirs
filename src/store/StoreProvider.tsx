import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type Dispatch,
  type ReactNode,
} from 'react';
import type { AppAction, AppState } from '@/types';
import { loadState, saveState } from '@/lib/storage';
import { applyThemeMode } from '@/lib/theme';
import { appReducer } from '@/store/reducer';

interface StoreContextValue {
  state: AppState;
  dispatch: Dispatch<AppAction>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, loadState);
  const isFirstThemeApply = useRef(true);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    const animate = !isFirstThemeApply.current;
    isFirstThemeApply.current = false;
    applyThemeMode(state.settings.theme, { animate });
  }, [state.settings.theme]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return ctx;
}
