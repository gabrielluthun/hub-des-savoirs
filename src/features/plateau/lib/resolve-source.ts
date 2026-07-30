import { normalizeAnswer } from '@/features/plateau/lib/question-types';
import type { AnkiCard, HubDocument, JetPunkList } from '@/types';

export type PlateauSourceLink =
  | { kind: 'doc'; id: string; title: string }
  | { kind: 'anki'; id: string; label: string; deck: string }
  | { kind: 'jetpunk'; listId: string; listTitle: string; label: string };

export function resolveSourceLink(params: {
  answer: string;
  question: string;
  docs: HubDocument[];
  cards: AnkiCard[];
  lists: JetPunkList[];
}): PlateauSourceLink | null {
  const answerKey = normalizeAnswer(params.answer);
  const questionKey = normalizeAnswer(params.question);
  if (!answerKey && !questionKey) return null;

  for (const card of params.cards) {
    if (normalizeAnswer(card.answer) === answerKey) {
      return {
        kind: 'anki',
        id: card.id,
        label: card.question.trim() || 'Carte Anki',
        deck: card.deck.trim() || 'Sans deck',
      };
    }
    if (
      answerKey &&
      normalizeAnswer(card.question).includes(answerKey) &&
      answerKey.length >= 4
    ) {
      return {
        kind: 'anki',
        id: card.id,
        label: card.question.trim() || 'Carte Anki',
        deck: card.deck.trim() || 'Sans deck',
      };
    }
  }

  for (const list of params.lists) {
    for (const item of list.items) {
      if (normalizeAnswer(item.answer) !== answerKey) continue;
      return {
        kind: 'jetpunk',
        listId: list.id,
        listTitle: list.title.trim() || 'Liste JetPunk',
        label: item.prompt.trim() || item.answer,
      };
    }
  }

  for (const doc of params.docs) {
    const contentKey = normalizeAnswer(doc.content);
    if (!contentKey) continue;
    if (answerKey && contentKey.includes(answerKey) && answerKey.length >= 3) {
      return {
        kind: 'doc',
        id: doc.id,
        title: doc.title.trim() || 'Document',
      };
    }
  }

  return null;
}

export function sourceLinkLabel(link: PlateauSourceLink): string {
  if (link.kind === 'doc') return `Doc · ${link.title}`;
  if (link.kind === 'anki') return `Anki · ${link.deck}`;
  return `JetPunk · ${link.listTitle}`;
}
