import type { GeneratedQuestion } from '@/types';

export interface PlateauAnswerRecord {
  question: GeneratedQuestion;
  correct: boolean;
  /** What the player submitted (or partial list finds). */
  userAnswer: string;
}

export interface PlateauGameResult {
  score: number;
  total: number;
  elapsedSec: number;
  answers: PlateauAnswerRecord[];
}

export interface PlateauScoreMark {
  score: number;
  total: number;
}

export function scoreFromAnswers(answers: PlateauAnswerRecord[]): number {
  return answers.filter((entry) => entry.correct).length;
}

function ratio(mark: PlateauScoreMark): number {
  return mark.total > 0 ? mark.score / mark.total : 0;
}

/** Best mark by success rate, then by absolute score. */
export function pickBestScoreMark(
  marks: PlateauScoreMark[]
): PlateauScoreMark | null {
  let best: PlateauScoreMark | null = null;
  for (const mark of marks) {
    if (mark.total <= 0) continue;
    if (!best) {
      best = mark;
      continue;
    }
    const bestRatio = ratio(best);
    const nextRatio = ratio(mark);
    if (nextRatio > bestRatio) best = mark;
    else if (nextRatio === bestRatio && mark.score > best.score) best = mark;
  }
  return best;
}

export function isNewScoreRecord(
  current: PlateauScoreMark,
  previous: PlateauScoreMark | null
): boolean {
  if (current.total <= 0) return false;
  if (!previous) return current.score > 0;
  const currentRatio = ratio(current);
  const previousRatio = ratio(previous);
  if (currentRatio > previousRatio) return true;
  if (currentRatio < previousRatio) return false;
  return current.score > previous.score;
}
