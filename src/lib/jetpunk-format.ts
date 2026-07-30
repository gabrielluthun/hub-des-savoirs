import type { JetPunkList } from '@/types';

export type JetpunkExportItem = {
  prompt: string;
  answer: string;
};

export type JetpunkExportList = {
  title: string;
  category: string;
  durationSec: number;
  items: JetpunkExportItem[];
};

export type JetpunkExportFile = {
  version: 1;
  lists: JetpunkExportList[];
};

export function toJetpunkExportList(list: JetPunkList): JetpunkExportList {
  return {
    title: list.title,
    category: list.category,
    durationSec: list.durationSec,
    items: list.items.map(({ prompt, answer }) => ({ prompt, answer })),
  };
}

/** Always `{ version: 1, lists: [...] }` — one or many lists. */
export function serializeJetpunkLists(lists: JetPunkList[]): string {
  const payload: JetpunkExportFile = {
    version: 1,
    lists: lists.map(toJetpunkExportList),
  };
  return `${JSON.stringify(payload, null, 2)}\n`;
}

export function jetpunkExportFilename(title?: string): string {
  if (!title) return 'jetpunk-lists.json';
  const slug =
    title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'liste';
  return `jetpunk-${slug}.json`;
}

function asExportList(value: unknown): JetpunkExportList | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  if (!Array.isArray(raw.items)) return null;
  const items: JetpunkExportItem[] = [];
  for (const entry of raw.items) {
    if (!entry || typeof entry !== 'object') continue;
    const item = entry as Record<string, unknown>;
    const answer = String(item.answer ?? '').trim();
    if (!answer) continue;
    items.push({
      prompt: String(item.prompt ?? ''),
      answer,
    });
  }
  if (items.length === 0) return null;
  const durationSec = Number(raw.durationSec);
  return {
    title: String(raw.title ?? '').trim() || 'Liste importée',
    category: String(raw.category ?? '').trim() || 'Général',
    durationSec: Number.isFinite(durationSec) && durationSec > 0 ? durationSec : 90,
    items,
  };
}

/** Parses hub export JSON (`version: 1`) or a single list object with `items`. */
export function parseJetpunkExportJson(raw: string): JetpunkExportList[] {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error('JSON invalide.');
  }

  if (data && typeof data === 'object' && Array.isArray((data as JetpunkExportFile).lists)) {
    const lists = (data as JetpunkExportFile).lists
      .map(asExportList)
      .filter((list): list is JetpunkExportList => Boolean(list));
    if (lists.length === 0) throw new Error('Aucune liste valide dans le JSON.');
    return lists;
  }

  const single = asExportList(data);
  if (single) return [single];
  throw new Error('JSON JetPunk invalide (attendu version 1 + lists).');
}
