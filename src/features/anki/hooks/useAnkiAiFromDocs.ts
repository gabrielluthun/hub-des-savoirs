import { useState } from 'react';
import { toast } from 'sonner';
import { useGenerateCards } from '@/features/anki/hooks/useGenerateCards';
import type { ImportableAnkiCard } from '@/features/anki/hooks/useAnkiImportExport';
import { normalizeDeckName } from '@/features/anki/lib/decks';
import { setTab } from '@/store/actions';
import type { AppAction, GeminiModel, HubDocument } from '@/types';

type Dispatch = (action: AppAction) => void;

export function useAnkiAiFromDocs(params: {
  docs: HubDocument[];
  apiKey: string;
  model: GeminiModel;
  dispatch: Dispatch;
  importParsedCards: (parsed: ImportableAnkiCard[]) => void;
  /** All Anki cards — used to avoid regenerating duplicates in the target deck. */
  existingCards: { question: string; answer: string; deck: string }[];
}) {
  const { docs, apiKey, model, dispatch, importParsedCards, existingCards } =
    params;
  const [showAiPanel, setShowAiPanel] = useState(false);
  const ai = useGenerateCards();

  const toggleAiPanel = () => setShowAiPanel((value) => !value);

  const handleNeedApiKey = () => {
    toast.error('Ajoutez votre clé API Gemini dans Paramètres.');
    dispatch(setTab('settings'));
  };

  const handleAiGenerate = async (generateParams: {
    docId: string;
    count: number;
    deck: string;
  }) => {
    const deck = normalizeDeckName(generateParams.deck);
    if (!deck) {
      toast.error('Sélectionne ou indique un deck cible avant de générer.');
      return;
    }
    const doc = docs.find((item) => item.id === generateParams.docId);
    if (!doc) {
      toast.error('Document introuvable.');
      return;
    }
    try {
      const generated = await ai.generate({
        apiKey,
        model,
        doc,
        count: generateParams.count,
        deckName: deck,
        existingCards,
      });
      toast.success(
        `${generated.length} carte${generated.length > 1 ? 's' : ''} générée${generated.length > 1 ? 's' : ''}.`
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Échec de la génération.');
    }
  };

  const handleAiSave = (saveParams: {
    drafts: { question: string; answer: string; mnemonic: string }[];
    deck: string;
    indices: number[];
  }) => {
    const deck = normalizeDeckName(saveParams.deck);
    if (!deck) {
      toast.error('Indique un deck avant d’ajouter les cartes.');
      return;
    }
    const selectedDrafts = saveParams.indices
      .map((index) => saveParams.drafts[index])
      .filter((draft): draft is { question: string; answer: string; mnemonic: string } =>
        Boolean(draft)
      )
      .map((draft) => ({
        question: draft.question,
        answer: draft.answer,
        deck,
        mnemonic: draft.mnemonic,
        tags: [] as string[],
      }));

    importParsedCards(selectedDrafts);
    ai.clear();
  };

  return {
    showAiPanel,
    toggleAiPanel,
    ai,
    handleNeedApiKey,
    handleAiGenerate,
    handleAiSave,
  };
}
