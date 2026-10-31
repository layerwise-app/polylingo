import { fillBlankSentence } from '~/content/course';
import { splitWords } from '~/content/speech';
import type { Exercise } from '~/content/types';

/** What the lesson player sends for each exercise. */
export type Answer =
  | { kind: 'choice'; value: string }
  | { kind: 'text'; value: string }
  | { kind: 'words'; value: string[] }
  | { kind: 'pairs'; value: [string, string][]; mismatches: number };

export type GradeResult = {
  correct: boolean;
  /** The answer as it should be written. */
  canonical: string;
  /** Correct, but the learner left out or misplaced an accent. */
  accentFix: boolean;
};

/** Lowercases and removes punctuation, keeping accents. */
export function normalizeText(text: string): string {
  return text
    .normalize('NFC')
    .toLocaleLowerCase('es')
    .replace(/[¿?¡!.,;:"“”‘’'()\-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Also removes accents, including the tilde on ñ, which US keyboards can't easily type. */
export function foldAccents(text: string): string {
  return normalizeText(text)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function gradeTyped(
  input: string,
  canonical: string,
  accepted: string[] = []
): GradeResult {
  const candidates = [canonical, ...accepted];
  const typed = normalizeText(input);
  if (candidates.some((candidate) => normalizeText(candidate) === typed)) {
    return { correct: true, canonical, accentFix: false };
  }
  const folded = foldAccents(input);
  if (candidates.some((candidate) => foldAccents(candidate) === folded)) {
    return { correct: true, canonical, accentFix: true };
  }
  return { correct: false, canonical, accentFix: false };
}

/** The Spanish shown as the answer once an exercise has been checked. */
export function canonicalAnswer(exercise: Exercise): string {
  switch (exercise.type) {
    case 'picture_choice':
      return exercise.answer;
    case 'build_sentence':
    case 'listen_type':
      return exercise.es;
    case 'match_pairs':
      return exercise.pairs
        .map((pair) => `${pair.es} = ${pair.en}`)
        .join(' · ');
    case 'fill_blank':
      return fillBlankSentence(exercise.sentence, exercise.answer);
  }
}

export function gradeAnswer(exercise: Exercise, answer: Answer): GradeResult {
  const canonical = canonicalAnswer(exercise);
  const wrong: GradeResult = { correct: false, canonical, accentFix: false };

  switch (exercise.type) {
    case 'picture_choice':
      return answer.kind === 'choice' && answer.value === exercise.answer
        ? { correct: true, canonical, accentFix: false }
        : wrong;

    case 'build_sentence': {
      if (answer.kind !== 'words') return wrong;
      const built = normalizeText(answer.value.join(' '));
      const correct = [exercise.es, ...(exercise.accept ?? [])].some(
        (candidate) => normalizeText(candidate) === built
      );
      return { correct, canonical, accentFix: false };
    }

    case 'listen_type':
      return answer.kind === 'text'
        ? gradeTyped(answer.value, exercise.es, exercise.accept)
        : wrong;

    case 'match_pairs': {
      if (answer.kind !== 'pairs') return wrong;
      if (answer.mismatches > 0) return wrong;
      const expected = new Map(exercise.pairs.map((pair) => [pair.es, pair.en]));
      const correct =
        answer.value.length === exercise.pairs.length &&
        new Set(answer.value.map(([es]) => es)).size === expected.size &&
        answer.value.every(([es, en]) => expected.get(es) === en);
      return { correct, canonical, accentFix: false };
    }

    case 'fill_blank': {
      if (exercise.options) {
        return answer.kind === 'choice' && answer.value === exercise.answer
          ? { correct: true, canonical, accentFix: false }
          : wrong;
      }
      if (answer.kind !== 'text') return wrong;
      // A learner may type just the word or the whole sentence.
      const word = gradeTyped(answer.value, exercise.answer);
      const result = word.correct ? word : gradeTyped(answer.value, canonical);
      return { ...result, canonical };
    }
  }
}

/** The tiles in a word bank before shuffling. The first word is lowercased so it isn't a giveaway. */
export function wordBankTiles(exercise: {
  es: string;
  distractors: string[];
}): string[] {
  const [first = '', ...rest] = splitWords(exercise.es);
  const isName = /^(Ana|Carlos|Chicago|Madrid|México|Rosa)$/.test(first);
  return [
    isName ? first : first.toLocaleLowerCase('es'),
    ...rest,
    ...exercise.distractors
  ];
}
