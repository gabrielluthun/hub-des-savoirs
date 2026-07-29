import type { AnkiCard, HubDocument, JetPunkList, QuizSource } from '@/types';

export function buildQuizContext(params: {
  source: QuizSource;
  docs: HubDocument[];
  ankiCards: AnkiCard[];
  jetpunkLists: JetPunkList[];
}): string {
  const parts: string[] = [];

  if (params.source === 'all' || params.source === 'docs') {
    for (const doc of params.docs) {
      if (!doc.content.trim()) continue;
      parts.push(`# Document : ${doc.title}\n${doc.content}`);
    }
  }

  if (params.source === 'all' || params.source === 'anki') {
    if (params.ankiCards.length > 0) {
      const lines = params.ankiCards.map(
        (card) => `- Q: ${card.question} | R: ${card.answer}`
      );
      parts.push(`# Cartes Anki\n${lines.join('\n')}`);
    }
  }

  if (params.source === 'all' || params.source === 'jetpunk') {
    for (const list of params.jetpunkLists) {
      const lines = list.items
        .filter((item) => item.prompt.trim() || item.answer.trim())
        .map((item) => `- ${item.prompt} → ${item.answer}`);
      if (lines.length === 0) continue;
      parts.push(`# Liste JetPunk : ${list.title} (${list.category})\n${lines.join('\n')}`);
    }
  }

  return parts.join('\n\n').trim();
}
