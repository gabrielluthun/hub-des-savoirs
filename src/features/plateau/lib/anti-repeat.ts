import { normalizeAnswer } from '@/features/plateau/lib/question-types';
import type {
  GameHistoryEntry,
  GeneratedQuestion,
  PlayedQuizFact,
} from '@/types';

const MAX_EXCLUSION_FACTS = 40;
const MAX_GAMES_SCANNED = 20;

export function toPlayedFact(question: GeneratedQuestion): PlayedQuizFact {
  return {
    question: question.question.trim(),
    answer: question.answer.trim(),
    type: question.type,
  };
}

export function factKey(fact: Pick<PlayedQuizFact, 'question' | 'answer'>): string {
  return `${normalizeAnswer(fact.question)}|${normalizeAnswer(fact.answer)}`;
}

/** Collect recent posed Q/A pairs to exclude from the next generation. */
export function collectRecentFacts(history: GameHistoryEntry[]): PlayedQuizFact[] {
  const seen = new Set<string>();
  const facts: PlayedQuizFact[] = [];

  for (const entry of history.slice(0, MAX_GAMES_SCANNED)) {
    for (const fact of entry.questions ?? []) {
      const question = fact.question?.trim();
      const answer = fact.answer?.trim();
      if (!question || !answer) continue;
      const key = factKey({ question, answer });
      if (seen.has(key)) continue;
      seen.add(key);
      facts.push({ question, answer, type: fact.type });
      if (facts.length >= MAX_EXCLUSION_FACTS) return facts;
    }
  }

  return facts;
}

/** Fisher–Yates shuffle (copy). */
export function shuffleCopy<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = next[i]!;
    next[i] = next[j]!;
    next[j] = tmp;
  }
  return next;
}

/** Drop generated questions that collide with recent history (normalized). */
export function filterRepeatedQuestions(
  questions: GeneratedQuestion[],
  recent: PlayedQuizFact[]
): GeneratedQuestion[] {
  if (recent.length === 0) return questions;
  const banned = new Set(recent.map((fact) => factKey(fact)));
  return questions.filter((question) => !banned.has(factKey(question)));
}

export function shuffleQuestionOptions(
  question: GeneratedQuestion
): GeneratedQuestion {
  if (question.type !== 'qcm' || !question.options || question.options.length < 2) {
    return question;
  }
  return { ...question, options: shuffleCopy(question.options) };
}
