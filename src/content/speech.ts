import type { Exercise, Lesson } from './types';
import { fillBlankSentence } from './course';

/**
 * Finds every piece of Spanish that needs audio. The audio pipeline, the course
 * validator, and the lesson player all use these functions, so editing the
 * course data is enough to change what gets recorded.
 */

const edgePunctuation = /^[\s¿¡"'“”(]+|[\s.,;:!?"'“”)]+$/gu;

/** Splits a sentence into bare words: `¿Cómo estás?` becomes `Cómo`, `estás`. */
export function splitWords(text: string): string[] {
  return text
    .split(/\s+/)
    .map((word) => word.replace(edgePunctuation, ''))
    .filter(Boolean);
}

/** The manifest key for a clip. Sentences keep punctuation, which shapes intonation. */
export function audioKey(text: string): string {
  return text.normalize('NFC').trim().toLocaleLowerCase('es');
}

/** The manifest key for one bare word. */
export function wordKey(word: string): string {
  return audioKey(word.replace(edgePunctuation, ''));
}

function exerciseSentences(exercise: Exercise): string[] {
  switch (exercise.type) {
    case 'picture_choice':
      return exercise.options.map((option) => option.es);
    case 'build_sentence':
      return [exercise.es, ...(exercise.accept ?? []), ...exercise.distractors];
    case 'listen_type':
      return [exercise.es];
    case 'match_pairs':
      return exercise.pairs.map((pair) => pair.es);
    case 'fill_blank':
      return [
        fillBlankSentence(exercise.sentence, exercise.answer),
        exercise.answer,
        ...(exercise.options ?? [])
      ];
  }
}

export type SpeechText = {
  key: string;
  /** Exactly what the voice should say. */
  text: string;
  kind: 'sentence' | 'word';
  lessons: string[];
};

/** Every clip the course needs: full sentences and phrases, plus each bare word. */
export function collectSpeech(lessons: Lesson[]): SpeechText[] {
  const clips = new Map<string, SpeechText>();

  const add = (text: string, kind: SpeechText['kind'], lessonId: string) => {
    const key = kind === 'word' ? wordKey(text) : audioKey(text);
    if (!key) return;
    const existing = clips.get(key);
    if (existing) {
      if (!existing.lessons.includes(lessonId)) {
        existing.lessons.push(lessonId);
      }
      return;
    }
    clips.set(key, {
      key,
      text: text.trim(),
      kind,
      lessons: [lessonId]
    });
  };

  for (const lesson of lessons) {
    const sentences = [
      ...lesson.exercises.flatMap(exerciseSentences),
      ...lesson.vocabulary.map((entry) => entry.es)
    ];
    for (const sentence of sentences) {
      const words = splitWords(sentence);
      add(sentence, words.length > 1 ? 'sentence' : 'word', lesson.id);
      for (const word of words) add(word, 'word', lesson.id);
    }
  }

  return [...clips.values()].sort((a, b) => a.key.localeCompare(b.key, 'es'));
}
