import { useState } from 'react';
import { toast } from 'sonner';
import {
  buildExistingQuestionKeys,
  partitionByQuestionDeduplication,
} from '@/features/anki/lib/import/deduplication';
import { createAnkiCard } from '@/features/anki/lib/srs/card-factory';
import { parseBulkAnkiInput, serializeAnkiCards } from '@/lib/anki-format';
import { downloadTextFile } from '@/lib/export';
import { addAnkiCards } from '@/store/actions';
import type { AnkiCard, AppAction } from '@/types';

type Dispatch = (action: AppAction) => void;

export type ImportableAnkiCard = {
  question: string;
  answer: string;
  deck: string;
  mnemonic: string;
  tags: string[];
};

export function useAnkiImportExport(params: {
  cards: AnkiCard[];
  scopedCards: AnkiCard[];
  dispatch: Dispatch;
}) {
  const { cards, scopedCards, dispatch } = params;
  const [bulk, setBulk] = useState('');
  const [deduplicationReport, setDeduplicationReport] = useState<{
    added: number;
    skipped: number;
    skippedQuestions: string[];
  } | null>(null);

  const importParsedCards = (parsed: ImportableAnkiCard[]) => {
    if (parsed.length === 0) {
      toast.error('Aucune carte valide à importer.');
      return;
    }

    const { unique, duplicates } = partitionByQuestionDeduplication(
      parsed,
      buildExistingQuestionKeys(cards)
    );

    if (unique.length > 0) {
      dispatch(
        addAnkiCards(
          unique.map((card) =>
            createAnkiCard({
              question: card.question,
              answer: card.answer,
              mnemonic: card.mnemonic,
              deck: card.deck,
              tags: card.tags,
            })
          )
        )
      );
    }

    setDeduplicationReport({
      added: unique.length,
      skipped: duplicates.length,
      skippedQuestions: duplicates.map((card) => card.question),
    });

    if (unique.length === 0) {
      toast.message('Tous les doublons ont été ignorés.');
      return;
    }

    toast.success(
      `${unique.length} carte${unique.length > 1 ? 's' : ''} ajoutée${unique.length > 1 ? 's' : ''}${
        duplicates.length > 0
          ? ` (${duplicates.length} doublon${duplicates.length > 1 ? 's' : ''} ignoré${duplicates.length > 1 ? 's' : ''})`
          : ''
      }.`
    );
  };

  const handleBulkImport = () => {
    const parsed = parseBulkAnkiInput(bulk);
    importParsedCards(parsed);
    if (parsed.length > 0) setBulk('');
  };

  const handleTxtFile = async (file: File) => {
    try {
      const text = await file.text();
      importParsedCards(parseBulkAnkiInput(text));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Échec de l'import .txt.");
    }
  };

  const handleExport = () => {
    if (scopedCards.length === 0) {
      toast.error('Aucune carte à exporter.');
      return;
    }
    downloadTextFile('anki-cards.txt', serializeAnkiCards(scopedCards));
    toast.success('Export .txt téléchargé.');
  };

  const dismissDeduplicationReport = () => setDeduplicationReport(null);

  return {
    bulk,
    setBulk,
    deduplicationReport,
    dismissDeduplicationReport,
    importParsedCards,
    handleBulkImport,
    handleTxtFile,
    handleExport,
  };
}
