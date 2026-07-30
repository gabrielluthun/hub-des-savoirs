export const DEFAULT_ANKI_DECK = 'Défaut';

export function normalizeDeckName(raw: string): string {
  const trimmed = raw.trim().replace(/\s+/g, ' ');
  return trimmed || DEFAULT_ANKI_DECK;
}

export function decksEqual(a: string, b: string): boolean {
  return normalizeDeckName(a).toLowerCase() === normalizeDeckName(b).toLowerCase();
}
