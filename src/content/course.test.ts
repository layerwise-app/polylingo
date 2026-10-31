import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { illustrations } from '~/components/art/illustrations';
import { achievements } from '~/content/achievements';
import {
  fillBlankSentence,
  freeLessonId,
  lessons,
  translateWord
} from '~/content/course';
import { audioKey, collectSpeech, splitWords, wordKey } from '~/content/speech';
import type { Exercise } from '~/content/types';
import { gradeAnswer, wordBankTiles, type Answer } from '~/lib/grading';

function correctAnswer(exercise: Exercise): Answer {
  switch (exercise.type) {
    case 'picture_choice':
      return { kind: 'choice', value: exercise.answer };
    case 'build_sentence':
      return { kind: 'words', value: splitWords(exercise.es) };
    case 'listen_type':
      return { kind: 'text', value: exercise.es };
    case 'match_pairs':
      return {
        kind: 'pairs',
        value: exercise.pairs.map((pair) => [pair.es, pair.en]),
        mismatches: 0
      };
    case 'fill_blank':
      return exercise.options
        ? { kind: 'choice', value: exercise.answer }
        : { kind: 'text', value: exercise.answer };
  }
}

const allExercises = lessons.flatMap((lesson) => lesson.exercises);

describe('the course', () => {
  it('has the 10 required lessons in order', () => {
    expect(lessons.map((lesson) => lesson.title)).toEqual([
      'Greetings',
      'Introductions',
      'Numbers',
      'Family',
      'Food',
      'Daily Routine',
      'Directions',
      'Shopping',
      'Time & Weather',
      'Travel'
    ]);
    expect(freeLessonId).toBe('greetings');
  });

  it('uses unique ids', () => {
    const ids = allExercises.map((exercise) => exercise.id);
    expect(new Set(ids).size).toBe(ids.length);
    const lessonIds = lessons.map((lesson) => lesson.id);
    expect(new Set(lessonIds).size).toBe(lessonIds.length);
  });

  it.each(lessons.map((lesson) => [lesson.title, lesson] as const))(
    '%s has 8-10 exercises covering every type',
    (_title, lesson) => {
      expect(lesson.exercises.length).toBeGreaterThanOrEqual(8);
      expect(lesson.exercises.length).toBeLessThanOrEqual(10);
      expect(new Set(lesson.exercises.map((item) => item.type))).toEqual(
        new Set([
          'picture_choice',
          'build_sentence',
          'listen_type',
          'match_pairs',
          'fill_blank'
        ])
      );
      expect(illustrations[lesson.art]).toBeDefined();
    }
  );

  it('gives every exercise a hint and an English translation', () => {
    for (const exercise of allExercises) {
      expect(exercise.hint.trim(), exercise.id).not.toBe('');
      switch (exercise.type) {
        case 'build_sentence':
        case 'listen_type':
        case 'fill_blank':
          expect(exercise.en.trim(), exercise.id).not.toBe('');
          break;
        case 'picture_choice':
          for (const option of exercise.options) {
            expect(option.en.trim(), exercise.id).not.toBe('');
          }
          break;
        case 'match_pairs':
          for (const pair of exercise.pairs) {
            expect(pair.en.trim(), exercise.id).not.toBe('');
          }
          break;
      }
    }
  });

  it('accepts each exercise’s own answer', () => {
    for (const exercise of allExercises) {
      expect(gradeAnswer(exercise, correctAnswer(exercise)).correct, exercise.id)
        .toBe(true);
    }
  });

  it('builds answerable word banks and picture and blank options', () => {
    for (const exercise of allExercises) {
      if (exercise.type === 'build_sentence') {
        const tiles = wordBankTiles(exercise).map(audioKey);
        for (const word of splitWords(exercise.es).map(audioKey)) {
          expect(tiles, exercise.id).toContain(word);
        }
        for (const distractor of exercise.distractors) {
          expect(splitWords(exercise.es).map(audioKey), exercise.id).not.toContain(
            audioKey(distractor)
          );
        }
      }
      if (exercise.type === 'picture_choice') {
        expect(exercise.options, exercise.id).toHaveLength(4);
        expect(exercise.options.map((option) => option.es), exercise.id).toContain(
          exercise.answer
        );
        for (const option of exercise.options) {
          expect(illustrations[option.art], `${exercise.id} ${option.art}`).toBeDefined();
        }
      }
      if (exercise.type === 'fill_blank') {
        expect(exercise.sentence, exercise.id).toContain('___');
        if (exercise.options) {
          expect(exercise.options, exercise.id).toContain(exercise.answer);
        }
      }
    }
  });

  it('can translate every Spanish word a learner can tap', () => {
    const missing = new Set<string>();
    for (const exercise of allExercises) {
      const texts =
        exercise.type === 'fill_blank'
          ? [fillBlankSentence(exercise.sentence, exercise.answer)]
          : exercise.type === 'build_sentence' || exercise.type === 'listen_type'
            ? [exercise.es]
            : [];
      for (const word of texts.flatMap(splitWords)) {
        if (!translateWord(wordKey(word))) missing.add(word);
      }
    }
    expect([...missing]).toEqual([]);
  });

  it('points achievements at real artwork', () => {
    for (const achievement of achievements) {
      expect(illustrations[achievement.art], achievement.id).toBeDefined();
    }
  });
});

describe('the audio manifest', () => {
  const manifestPath = 'public/audio/manifest.json';

  it('has a normal and a slow clip for all Spanish in the course', () => {
    expect(existsSync(manifestPath), 'Run pnpm audio:generate first').toBe(true);
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
      clips: Record<string, { normal: string; slow: string }>;
    };
    const missing: string[] = [];
    for (const clip of collectSpeech(lessons)) {
      const entry = manifest.clips[clip.key];
      if (
        !entry ||
        !existsSync(`public${entry.normal}`) ||
        !existsSync(`public${entry.slow}`)
      ) {
        missing.push(clip.key);
      }
    }
    expect(missing).toEqual([]);
  });
});
