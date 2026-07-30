import { Play, Sparkles } from 'lucide-react';
import { QuestionTypePicker } from '@/features/plateau/components/QuestionTypePicker';
import { SourcePicker } from '@/features/plateau/components/SourcePicker';
import { Button, Label, Select } from '@/components/ui/primitives';
import type {
  Difficulty,
  HubDocument,
  JetPunkList,
  QuestionType,
  QuizSource,
  QuizSourceSelection,
} from '@/types';

interface GameSetupProps {
  count: number;
  difficulty: Difficulty;
  selection: QuizSourceSelection;
  questionTypes: QuestionType[];
  docs: HubDocument[];
  deckNames: string[];
  lists: JetPunkList[];
  modelLabel: string;
  loading: boolean;
  onCountChange: (value: number) => void;
  onDifficultyChange: (value: Difficulty) => void;
  onSelectionChange: (value: QuizSourceSelection) => void;
  onQuestionTypesChange: (types: QuestionType[]) => void;
  onStart: () => void;
}

export function GameSetup({
  count,
  difficulty,
  selection,
  questionTypes,
  docs,
  deckNames,
  lists,
  modelLabel,
  loading,
  onCountChange,
  onDifficultyChange,
  onSelectionChange,
  onQuestionTypesChange,
  onStart,
}: GameSetupProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Nombre de questions</Label>
          <Select
            value={String(count)}
            onChange={(e) => onCountChange(Number(e.target.value))}
          >
            {[3, 5, 8, 10].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Difficulté</Label>
          <Select
            value={difficulty}
            onChange={(e) => onDifficultyChange(e.target.value as Difficulty)}
          >
            <option value="facile">Facile</option>
            <option value="moyen">Moyen</option>
            <option value="difficile">Difficile</option>
            <option value="expert">Expert</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Type de source</Label>
          <Select
            value={selection.kind}
            onChange={(e) =>
              onSelectionChange({
                ...selection,
                kind: e.target.value as QuizSource,
              })
            }
          >
            <option value="all">Toutes mes ressources</option>
            <option value="docs">Notes Google Docs</option>
            <option value="anki">Cartes Anki</option>
            <option value="jetpunk">Listes JetPunk</option>
          </Select>
        </div>
      </div>

      <SourcePicker
        selection={selection}
        docs={docs}
        deckNames={deckNames}
        lists={lists}
        onChange={onSelectionChange}
      />

      <QuestionTypePicker selected={questionTypes} onChange={onQuestionTypesChange} />

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button type="button" variant="accent" disabled={loading} onClick={onStart}>
          <Play className="h-4 w-4" />
          {loading ? 'Génération…' : 'Lancer la partie'}
        </Button>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          Modèle : {modelLabel}
        </span>
      </div>
    </div>
  );
}
