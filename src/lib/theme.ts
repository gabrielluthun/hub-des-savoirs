import type { ThemeMode } from '@/types';

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> };
};

function setRootThemeClass(theme: ThemeMode) {
  const root = document.documentElement;
  const next = theme === 'light' ? 'light' : 'dark';
  root.classList.remove('dark', 'light');
  root.classList.add(next);
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Apply light/dark class on <html>.
 * When `animate` is true, cross-fade via View Transitions (or CSS fallback).
 */
export function applyThemeMode(
  theme: ThemeMode,
  options: { animate?: boolean } = {}
): void {
  const animate = Boolean(options.animate) && !prefersReducedMotion();
  const apply = () => setRootThemeClass(theme);

  if (!animate) {
    apply();
    return;
  }

  const doc = document as ViewTransitionDocument;
  if (typeof doc.startViewTransition === 'function') {
    doc.startViewTransition(apply);
    return;
  }

  const root = document.documentElement;
  root.classList.add('theme-animate');
  apply();
  window.setTimeout(() => {
    root.classList.remove('theme-animate');
  }, 400);
}
