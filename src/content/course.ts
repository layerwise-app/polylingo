import { greetings } from './lessons/01-greetings';
import { introductions } from './lessons/02-introductions';
import { numbers } from './lessons/03-numbers';
import { family } from './lessons/04-family';
import { food } from './lessons/05-food';
import { dailyRoutine } from './lessons/06-daily-routine';
import { directions } from './lessons/07-directions';
import { shopping } from './lessons/08-shopping';
import { timeWeather } from './lessons/09-time-weather';
import { travel } from './lessons/10-travel';
import type { Exercise, Lesson } from './types';

/** The learning path, in order. Learners unlock each lesson by finishing the one before it. */
export const lessons: Lesson[] = [
  greetings,
  introductions,
  numbers,
  family,
  food,
  dailyRoutine,
  directions,
  shopping,
  timeWeather,
  travel
];

/** The lesson visitors can try without an account. */
export const freeLessonId = lessons[0]!.id;

const exercisesById = new Map<string, { exercise: Exercise; lesson: Lesson }>(
  lessons.flatMap((lesson) =>
    lesson.exercises.map(
      (exercise) => [exercise.id, { exercise, lesson }] as const
    )
  )
);

export function getLesson(lessonId: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.id === lessonId);
}

export function getLessonIndex(lessonId: string): number {
  return lessons.findIndex((lesson) => lesson.id === lessonId);
}

export function getExercise(exerciseId: string): Exercise | undefined {
  return exercisesById.get(exerciseId)?.exercise;
}

export function getExerciseLesson(exerciseId: string): Lesson | undefined {
  return exercisesById.get(exerciseId)?.lesson;
}

/** The sentence with its blank filled in. */
export function fillBlankSentence(sentence: string, answer: string): string {
  return sentence.replace('___', answer);
}

/** Tap-to-translate lookup across every lesson, keyed by lowercase Spanish. */
const glossary = new Map<string, string>(
  lessons.flatMap((lesson) =>
    lesson.vocabulary.map(
      (entry) => [entry.es.toLocaleLowerCase('es'), entry.en] as const
    )
  )
);

export function translateWord(word: string): string | undefined {
  return glossary.get(word.toLocaleLowerCase('es'));
}

/** A short Spanish and English label for an exercise, used in the mistakes list. */
export function describeExercise(exercise: Exercise): {
  es: string;
  en: string;
} {
  switch (exercise.type) {
    case 'picture_choice': {
      return { es: exercise.answer, en: exercise.prompt };
    }
    case 'build_sentence':
    case 'listen_type':
      return { es: exercise.es, en: exercise.en };
    case 'match_pairs':
      return {
        es: exercise.pairs.map((pair) => pair.es).join(', '),
        en: exercise.pairs.map((pair) => pair.en).join(', ')
      };
    case 'fill_blank':
      return {
        es: fillBlankSentence(exercise.sentence, exercise.answer),
        en: exercise.en
      };
  }
}

/** The Spanish that should be spoken for this exercise's answer. */
export function exerciseSpeech(exercise: Exercise): string | null {
  switch (exercise.type) {
    case 'picture_choice':
      return exercise.answer;
    case 'build_sentence':
    case 'listen_type':
      return exercise.es;
    case 'fill_blank':
      return fillBlankSentence(exercise.sentence, exercise.answer);
    case 'match_pairs':
      return null;
  }
}
