import { useState } from 'react';
import { toast } from 'sonner';
import { DEFAULT_ANKI_DECK, normalizeDeckName } from '@/features/anki/lib/decks';
import { createAnkiCard } from '@/features/anki/lib/srs/card-factory';
import { addAnkiCard, updateAnkiCard } from '@/store/actions';
import type { AnkiCard } from '@/types';
import type { AppAction } from '@/types';

type Dispatch = (action: AppAction) => void;

export function useAnkiCardEditor(params: {
  dispatch: Dispatch;
  selectedDeck: string | null;
  selectedTags: string[];
}) {
  const { dispatch, selectedDeck, selectedTags } = params;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftQuestion, setDraftQuestion] = useState('');
  const [draftAnswer, setDraftAnswer] = useState('');
  const [draftMnemonic, setDraftMnemonic] = useState('');
  const [draftDeck, setDraftDeck] = useState(DEFAULT_ANKI_DECK);
  const [draftTags, setDraftTags] = useState<string[]>([]);
  const [showEditor, setShowEditor] = useState(false);

  const openNew = () => {
    setEditingId(null);
    setDraftQuestion('');
    setDraftAnswer('');
    setDraftMnemonic('');
    setDraftDeck(selectedDeck ?? DEFAULT_ANKI_DECK);
    setDraftTags([...selectedTags]);
    setShowEditor(true);
  };

  const openEdit = (card: AnkiCard) => {
    setEditingId(card.id);
    setDraftQuestion(card.question);
    setDraftAnswer(card.answer);
    setDraftMnemonic(card.mnemonic ?? '');
    setDraftDeck(card.deck || DEFAULT_ANKI_DECK);
    setDraftTags([...(card.tags ?? [])]);
    setShowEditor(true);
  };

  const closeEditor = () => setShowEditor(false);

  const saveCard = () => {
    if (!draftQuestion.trim() || !draftAnswer.trim()) {
      toast.error('Question et réponse sont obligatoires.');
      return;
    }
    if (!draftDeck.trim()) {
      toast.error('Le deck est obligatoire.');
      return;
    }
    const deck = normalizeDeckName(draftDeck);
    const mnemonic = draftMnemonic.trim();
    if (editingId) {
      dispatch(
        updateAnkiCard(editingId, {
          question: draftQuestion.trim(),
          answer: draftAnswer.trim(),
          mnemonic,
          deck,
          tags: draftTags,
        })
      );
      toast.success('Carte mise à jour.');
    } else {
      dispatch(
        addAnkiCard(
          createAnkiCard({
            question: draftQuestion.trim(),
            answer: draftAnswer.trim(),
            mnemonic,
            deck,
            tags: draftTags,
          })
        )
      );
      toast.success('Carte ajoutée.');
    }
    setShowEditor(false);
  };

  return {
    editingId,
    draftQuestion,
    setDraftQuestion,
    draftAnswer,
    setDraftAnswer,
    draftMnemonic,
    setDraftMnemonic,
    draftDeck,
    setDraftDeck,
    draftTags,
    setDraftTags,
    showEditor,
    openNew,
    openEdit,
    closeEditor,
    saveCard,
  };
}
