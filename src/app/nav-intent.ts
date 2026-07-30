/** One-shot intents when switching tabs from the sidebar. */

export type NavIntent =
  | { type: 'anki-review' }
  | { type: 'jetpunk-quiz'; listId: string };

const EVENT = 'hub:nav-intent';

let pending: NavIntent | null = null;

export function requestNavIntent(intent: NavIntent): void {
  pending = intent;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(EVENT));
  }
}

/** Consume only if the pending intent matches `expected` (other listeners keep it). */
export function consumeNavIntent<T extends NavIntent['type']>(
  expected: T
): Extract<NavIntent, { type: T }> | null {
  if (!pending || pending.type !== expected) return null;
  const intent = pending as Extract<NavIntent, { type: T }>;
  pending = null;
  return intent;
}

export function subscribeNavIntent(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
