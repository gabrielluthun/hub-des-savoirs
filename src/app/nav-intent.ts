/** One-shot intents when switching tabs from the sidebar. */

export type NavIntent = 'anki-review';

const EVENT = 'hub:nav-intent';

let pending: NavIntent | null = null;

export function requestNavIntent(intent: NavIntent): void {
  pending = intent;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(EVENT));
  }
}

export function consumeNavIntent(): NavIntent | null {
  const intent = pending;
  pending = null;
  return intent;
}

export function subscribeNavIntent(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
