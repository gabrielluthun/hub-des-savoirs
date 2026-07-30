import type { AnkiCard, HubDocument, JetPunkList, QuizSourceSelection } from '@/types';
import {
  filterCardsForSelection,
  filterDocsForSelection,
  filterListsForSelection,
} from '@/features/plateau/lib/source-selection';

export function buildQuizContext(params: {
  selection: QuizSourceSelection;
  docs: HubDocument[];
  ankiCards: AnkiCard[];
  jetpunkLists: JetPunkList[];
}): string {
  const parts: string[] = [];
  const docs = filterDocsForSelection(params.docs, params.selection);
  const cards = filterCardsForSelection(params.ankiCards, params.selection);
  const lists = filterListsForSelection(params.jetpunkLists, params.selection);

  if (params.selection.kind === 'all' || params.selection.kind === 'docs') {
    for (const doc of docs) {
      if (!doc.content.trim()) continue;
      parts.push(`# Document : ${doc.title}\n${doc.content}`);
    }
  }

  if (params.selection.kind === 'all' || params.selection.kind === 'anki') {
    if (cards.length > 0) {
      const lines = cards.map(
        (card) => `- Q: ${card.question} | R: ${card.answer}`
      );
      parts.push(`# Cartes Anki\n${lines.join('\n')}`);
    }
  }

  if (params.selection.kind === 'all' || params.selection.kind === 'jetpunk') {
    for (const list of lists) {
      const lines = list.items
        .filter((item) => item.prompt.trim() || item.answer.trim())
        .map((item) => `- ${item.prompt} → ${item.answer}`);
      if (lines.length === 0) continue;
      parts.push(`# Liste JetPunk : ${list.title} (${list.category})\n${lines.join('\n')}`);
    }
  }

  return parts.join('\n\n').trim();
}
