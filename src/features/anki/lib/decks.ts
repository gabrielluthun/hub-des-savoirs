/** Legacy fallback for older cards without a deck — not injected into the UI. */
export const DEFAULT_ANKI_DECK = 'Défaut';

/** Separates parent / child in a deck path, e.g. Histoire::Louis XIV */
export const DECK_PATH_SEP = '::';

export function normalizeDeckName(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, ' ')
    .split(DECK_PATH_SEP)
    .map((part) => part.trim())
    .filter(Boolean)
    .join(DECK_PATH_SEP);
}

export function decksEqual(a: string, b: string): boolean {
  return normalizeDeckName(a).toLowerCase() === normalizeDeckName(b).toLowerCase();
}

/** True if `deck` is exactly `root` or a nested path under it (root::…). */
export function deckIsUnder(deck: string, root: string): boolean {
  const d = normalizeDeckName(deck).toLowerCase();
  const r = normalizeDeckName(root).toLowerCase();
  if (!r) return false;
  return d === r || d.startsWith(`${r}${DECK_PATH_SEP}`);
}

export function deckPathSegments(name: string): string[] {
  const normalized = normalizeDeckName(name);
  if (!normalized) return [];
  return normalized.split(DECK_PATH_SEP);
}

export function deckLeafLabel(name: string): string {
  const segments = deckPathSegments(name);
  return segments[segments.length - 1] ?? name;
}

export function joinDeckPath(segments: string[]): string {
  return normalizeDeckName(segments.join(DECK_PATH_SEP));
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

export type DeckTreeNode = {
  /** Full path, e.g. Histoire::Louis XIV */
  path: string;
  /** Visible label (last segment) */
  label: string;
  children: DeckTreeNode[];
};

/**
 * Build a nested tree from flat deck paths.
 * Ensures intermediate parents exist as nodes even if never registered alone.
 */
export function buildDeckTree(decks: string[]): DeckTreeNode[] {
  type Mutable = { path: string; label: string; children: Map<string, Mutable> };
  const roots = new Map<string, Mutable>();

  const ensure = (segments: string[]): Mutable => {
    let map = roots;
    let node: Mutable | undefined;
    const acc: string[] = [];
    for (const segment of segments) {
      acc.push(segment);
      const key = segment.toLowerCase();
      let next = map.get(key);
      if (!next) {
        next = {
          path: joinDeckPath(acc),
          label: segment,
          children: new Map(),
        };
        map.set(key, next);
      }
      node = next;
      map = next.children;
    }
    return node!;
  };

  for (const deck of mergeDeckNames(decks)) {
    const segments = deckPathSegments(deck);
    if (segments.length === 0) continue;
    ensure(segments);
  }

  const toTree = (nodes: Map<string, Mutable>): DeckTreeNode[] =>
    [...nodes.values()]
      .sort((a, b) => a.label.localeCompare(b.label, 'fr'))
      .map((node) => ({
        path: node.path,
        label: node.label,
        children: toTree(node.children),
      }));

  return toTree(roots);
}
