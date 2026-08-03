import { useMemo, useState } from 'react';
import { Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { GameHistory } from '@/features/plateau/GameHistory';
import { GamePlay } from '@/features/plateau/GamePlay';
import { GameResults } from '@/features/plateau/GameResults';
import { GameSetup } from '@/features/plateau/GameSetup';
import { PlateauHelp } from '@/features/plateau/components/help/PlateauHelpDialog';
import { collectDecks } from '@/features/anki/lib/organization';
import {
  collectRecentFacts,
  toPlayedFact,
} from '@/features/plateau/lib/anti-repeat';
import {
  pickBestScoreMark,
  type PlateauGameResult,
  type PlateauScoreMark,
} from '@/features/plateau/lib/game-result';
import type { PlateauSourceLink } from '@/features/plateau/lib/resolve-source';
import { ALL_QUESTION_TYPES } from '@/features/plateau/lib/question-types';
import {
  selectionForKind,
  selectionHasResources,
} from '@/features/plateau/lib/source-selection';
import { generateQuizQuestions } from '@/features/plateau/lib/generate-quiz';
import { buildQuizContext } from '@/lib/quiz-context';
import { createId } from '@/lib/utils';
import {
  addGameHistory,
  setActiveDoc,
  setActiveJetpunkList,
  setTab,
} from '@/store/actions';
import { useStore } from '@/store/StoreProvider';
import {
  selectAnkiCards,
  selectAnkiDecks,
  selectDocs,
  selectGameHistory,
  selectJetpunkLists,
} from '@/store/selectors';
import type {
  Difficulty,
  GeneratedQuestion,
  QuestionType,
  QuizSourceSelection,
} from '@/types';

export function PlateauView() {
  const { state, dispatch } = useStore();
  const docs = selectDocs(state);
  const ankiCards = selectAnkiCards(state);
  const ankiDecks = selectAnkiDecks(state);
  const jetpunkLists = selectJetpunkLists(state);
  const history = selectGameHistory(state);
  const deckNames = useMemo(
    () => collectDecks(ankiCards, ankiDecks),
    [ankiCards, ankiDecks]
  );
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState<Difficulty>('moyen');
  const [selection, setSelection] = useState<QuizSourceSelection>(() =>
    selectionForKind('all', { docs, deckNames: [], lists: jetpunkLists })
  );
  const [questionTypes, setQuestionTypes] =
    useState<QuestionType[]>(ALL_QUESTION_TYPES);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<GeneratedQuestion[] | null>(null);
  const [liveScore, setLiveScore] = useState(0);
  const [lastResult, setLastResult] = useState<PlateauGameResult | null>(null);
  const [resultPreviousBest, setResultPreviousBest] =
    useState<PlateauScoreMark | null>(null);

  const handleSelectionChange = (next: QuizSourceSelection) => {
    if (next.kind !== selection.kind) {
      setSelection(
        selectionForKind(next.kind, { docs, deckNames, lists: jetpunkLists })
      );
      return;
    }
    setSelection(next);
  };

  const startGame = async () => {
    if (!state.settings.apiKey.trim()) {
      toast.error('Ajoutez votre clé API Gemini dans Paramètres.');
      dispatch(setTab('settings'));
      return;
    }

    if (!selectionHasResources(selection, { docs, cards: ankiCards, lists: jetpunkLists })) {
      toast.error(
        selection.kind === 'all'
          ? 'Aucune ressource disponible.'
          : 'Sélectionne au moins une ressource avec du contenu.'
      );
      return;
    }

    const context = buildQuizContext({
      selection,
      docs,
      ankiCards,
      jetpunkLists,
    });
    if (!context) {
      toast.error('Aucune ressource disponible pour cette source.');
      return;
    }

    const excludeFacts = collectRecentFacts(history);

    setLoading(true);
    setLastResult(null);
    try {
      const generated = await generateQuizQuestions({
        apiKey: state.settings.apiKey,
        model: state.settings.model,
        context,
        count,
        difficulty,
        questionTypes,
        excludeFacts,
      });
      setQuestions(generated);
      setLiveScore(0);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Échec de génération.');
    } finally {
      setLoading(false);
    }
  };

  const finishGame = (result: PlateauGameResult) => {
    const bestBefore = pickBestScoreMark(
      history.map((entry) => ({ score: entry.score, total: entry.total }))
    );
    dispatch(
      addGameHistory({
        id: createId(),
        score: result.score,
        total: result.total,
        difficulty,
        playedAt: new Date().toISOString(),
        questions: result.answers.map((entry) => toPlayedFact(entry.question)),
      })
    );
    setLiveScore(result.score);
    setQuestions(null);
    setResultPreviousBest(bestBefore);
    setLastResult(result);
  };

  const openSource = (link: PlateauSourceLink) => {
    if (link.kind === 'doc') {
      dispatch(setActiveDoc(link.id));
      dispatch(setTab('docs'));
      return;
    }
    if (link.kind === 'anki') {
      dispatch(setTab('anki'));
      return;
    }
    dispatch(setActiveJetpunkList(link.listId));
    dispatch(setTab('jetpunk'));
  };

  if (lastResult) {
    return (
      <GameResults
        result={lastResult}
        difficulty={difficulty}
        previousBest={resultPreviousBest}
        docs={docs}
        cards={ankiCards}
        lists={jetpunkLists}
        onReplay={() => {
          setLastResult(null);
          setResultPreviousBest(null);
          void startGame();
        }}
        onClose={() => {
          setLastResult(null);
          setResultPreviousBest(null);
        }}
        onOpenSource={openSource}
      />
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-quiz-accent">
              Rubrique spéciale
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl font-semibold">Le Plateau</h1>
              <PlateauHelp />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Questions générées par IA à partir de vos notes, listes et cartes.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-2">
            <Trophy className="h-4 w-4" />
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Score</p>
              <p className="font-medium tabular-nums">
                {liveScore}/{questions?.length ?? count}
              </p>
            </div>
          </div>
        </div>

        {questions ? (
          <GamePlay
            questions={questions}
            soundEnabled={state.settings.soundEnabled}
            onFinish={finishGame}
            onAbort={() => {
              setQuestions(null);
              toast.message('Partie abandonnée.');
            }}
          />
        ) : (
          <>
            <GameSetup
              count={count}
              difficulty={difficulty}
              selection={selection}
              questionTypes={questionTypes}
              docs={docs}
              deckNames={deckNames}
              lists={jetpunkLists}
              modelLabel={state.settings.model}
              loading={loading}
              onCountChange={setCount}
              onDifficultyChange={setDifficulty}
              onSelectionChange={handleSelectionChange}
              onQuestionTypesChange={setQuestionTypes}
              onStart={startGame}
            />
            <div className="mt-8">
              <GameHistory entries={history} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
