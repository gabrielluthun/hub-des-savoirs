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
