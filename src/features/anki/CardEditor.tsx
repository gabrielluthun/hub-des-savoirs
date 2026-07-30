import { Button, Input, Label, Textarea } from '@/components/ui/primitives';
import { TagPicker } from '@/features/anki/components/decks/TagPicker';

interface CardEditorProps {
  question: string;
  answer: string;
  mnemonic: string;
  deck: string;
  tags: string[];
  tagSuggestions?: string[];
  deckSuggestions?: string[];
  onQuestionChange: (value: string) => void;
  onAnswerChange: (value: string) => void;
  onMnemonicChange: (value: string) => void;
  onDeckChange: (value: string) => void;
  onTagsChange: (tags: string[]) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

export function CardEditor({
  question,
  answer,
  mnemonic,
  deck,
  tags,
  tagSuggestions = [],
  deckSuggestions = [],
  onQuestionChange,
  onAnswerChange,
  onMnemonicChange,
  onDeckChange,
  onTagsChange,
  onSave,
  onCancel,
  isEditing,
}: CardEditorProps) {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="space-y-1.5">
        <Label>Question</Label>
        <Input
          value={question}
          onChange={(e) => onQuestionChange(e.target.value)}
          placeholder="Capitale du Japon ?"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Réponse</Label>
        <Input
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Tokyo"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Deck</Label>
        <Input
          value={deck}
          onChange={(e) => onDeckChange(e.target.value)}
          placeholder="Défaut"
          list="anki-deck-suggestions"
        />
        <datalist id="anki-deck-suggestions">
          {deckSuggestions.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </div>
      <div className="space-y-1.5">
        <Label>Mnémotechnique (optionnel)</Label>
        <Textarea
          value={mnemonic}
          onChange={(e) => onMnemonicChange(e.target.value)}
          placeholder="Astuce pour mémoriser…"
          className="min-h-[72px]"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Tags (optionnel)</Label>
        <TagPicker tags={tags} onChange={onTagsChange} suggestions={tagSuggestions} />
      </div>
      <div className="flex gap-2">
        <Button type="button" onClick={onSave}>
          {isEditing ? 'Enregistrer' : 'Ajouter'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </div>
  );
}
