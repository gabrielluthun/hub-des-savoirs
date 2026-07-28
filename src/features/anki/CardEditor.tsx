import { Button, Input, Label } from '@/components/ui/primitives';

interface CardEditorProps {
  question: string;
  answer: string;
  onQuestionChange: (value: string) => void;
  onAnswerChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

export function CardEditor({
  question,
  answer,
  onQuestionChange,
  onAnswerChange,
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
