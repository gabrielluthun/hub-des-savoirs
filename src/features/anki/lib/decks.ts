/** Legacy fallback for older cards without a deck — not injected into the UI. */
export const DEFAULT_ANKI_DECK = 'Défaut';

export function normalizeDeckName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}

export function decksEqual(a: string, b: string): boolean {
  return normalizeDeckName(a).toLowerCase() === normalizeDeckName(b).toLowerCase();
}

/** Merge deck names (case-insensitive), drop empties, sort fr. */
export function mergeDeckNames(...lists: Array<string[] | undefined>): string[] {
  const byKey = new Map<string, string>();
  for (const list of lists) {
    for (const raw of list ?? []) {
      const name = normalizeDeckName(raw);
      if (!name) continue;
      const key = name.toLowerCase();
      if (!byKey.has(key)) byKey.set(key, name);
    }
  }
  return [...byKey.values()].sort((a, b) => a.localeCompare(b, 'fr'));
}

