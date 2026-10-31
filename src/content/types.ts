/** Course content types. Every lesson in `lessons/` is plain data of this shape. */

export type VocabEntry = {
  /** Spanish word or phrase, exactly as it should be shown. */
  es: string;
  /** English meaning, shown when a learner taps the word. */
  en: string;
};

type ExerciseBase = {
  /** Unique across the whole course. Progress and mistakes are stored by id. */
  id: string;
  /** A nudge shown when the learner taps "Hint". */
  hint: string;
};

/** "Which one is 'the apple'?" with four illustrated answers. */
export type PictureChoiceExercise = ExerciseBase & {
  type: 'picture_choice';
  /** The English word or phrase being asked for. */
  prompt: string;
  options: {
    /** Illustration key from `src/components/art/illustrations.tsx`. */
    art: string;
    es: string;
    en: string;
  }[];
  /** Must equal the `es` of one option. */
  answer: string;
};

/** Translate an English sentence by tapping Spanish tiles. */
export type BuildSentenceExercise = ExerciseBase & {
  type: 'build_sentence';
  /** The English sentence to translate. */
  en: string;
  /** The Spanish answer. Its words become tiles automatically. */
  es: string;
  /** Extra wrong tiles mixed into the word bank. */
  distractors: string[];
  /** Other correct word orders or wordings. */
  accept?: string[];
};

/** Hear a Spanish sentence and type it. */
export type ListenTypeExercise = ExerciseBase & {
  type: 'listen_type';
  /** The sentence that is played. Also the canonical answer. */
  es: string;
  /** The English translation, shown after answering. */
  en: string;
  /** Other correct spellings, such as digits for a number. */
  accept?: string[];
};

/** Tap Spanish and English tiles to pair them up. */
export type MatchPairsExercise = ExerciseBase & {
  type: 'match_pairs';
  pairs: VocabEntry[];
};

/** Complete a Spanish sentence by choosing or typing the missing word. */
export type FillBlankExercise = ExerciseBase & {
  type: 'fill_blank';
  /** The sentence, with `___` where the missing word goes. */
  sentence: string;
  answer: string;
  /** The English translation of the full sentence. */
  en: string;
  /** Word choices. Leave this out to make the learner type the answer. */
  options?: string[];
};

export type Exercise =
  | PictureChoiceExercise
  | BuildSentenceExercise
  | ListenTypeExercise
  | MatchPairsExercise
  | FillBlankExercise;

export type ExerciseType = Exercise['type'];

export type Lesson = {
  /** Stable id stored with each learner's progress. Don't change it after launch. */
  id: string;
  title: string;
  description: string;
  /** Illustration key for this lesson. */
  art: string;
  /** Every Spanish word and phrase this lesson teaches, for tap-to-translate. */
  vocabulary: VocabEntry[];
  /** 8 to 10 exercises, shown in this order. */
  exercises: Exercise[];
};
