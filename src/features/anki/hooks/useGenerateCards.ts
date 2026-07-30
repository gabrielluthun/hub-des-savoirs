import { useCallback, useState } from 'react';
import {
  generateAnkiCardsFromDoc,
  type GeneratedAnkiDraft,
} from '@/features/anki/lib/generate/generate-cards-from-doc';
import type { GeminiModel, HubDocument } from '@/types';

export function useGenerateCards() {
  const [loading, setLoading] = useState(false);
  const [drafts, setDrafts] = useState<GeneratedAnkiDraft[]>([]);

  const generate = useCallback(
    async (params: {
      apiKey: string;
      model: GeminiModel;
      doc: HubDocument;
      count: number;
      deckName: string;
    }) => {
      setLoading(true);
      try {
        const cards = await generateAnkiCardsFromDoc({
          apiKey: params.apiKey,
          model: params.model,
          docTitle: params.doc.title,
          content: params.doc.content,
          count: params.count,
          deckName: params.deckName,
        });
        setDrafts(cards);
        return cards;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clear = useCallback(() => setDrafts([]), []);

  return { loading, drafts, setDrafts, generate, clear };
}
