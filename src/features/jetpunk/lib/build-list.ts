import type { JetpunkExportList } from '@/lib/jetpunk-format';
import type { JetPunkList } from '@/types';
import { createId } from '@/lib/utils';

export function buildJetpunkList(list: JetpunkExportList): JetPunkList {
  return {
    id: createId(),
    title: list.title.trim() || 'Liste importée',
    category: list.category.trim() || 'Général',
    durationSec:
      Number.isFinite(list.durationSec) && list.durationSec > 0 ? list.durationSec : 90,
    items: list.items
      .filter((item) => item.answer.trim())
      .map((item) => ({
        id: createId(),
        prompt: item.prompt ?? '',
        answer: item.answer.trim(),
      })),
  };
}

export function buildJetpunkLists(lists: JetpunkExportList[]): JetPunkList[] {
  return lists.map(buildJetpunkList).filter((list) => list.items.length > 0);
}
