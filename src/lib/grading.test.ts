import { describe, expect, it } from 'vitest';
import type { Exercise } from '~/content/types';
import { foldAccents, gradeAnswer, normalizeText } from './grading';

const listen: Exercise = {
  id: 'test-listen',
  type: 'listen_type',
  es: 'Hola, ¿cómo estás?',
  en: 'Hello, how are you?',
  hint: 'A hint'
};

const blank: Exercise = {
  id: 'test-blank',
  type: 'fill_blank',
  sentence: 'Tengo diez ___.',
  answer: 'años',
  en: 'I am ten years old.',
  hint: 'A hint'
};

const pairs: Exercise = {
  id: 'test-pairs',
  type: 'match_pairs',
  hint: 'A hint',
  pairs: [
    { es: 'hola', en: 'hello' },
    { es: 'adiós', en: 'goodbye' }
  ]
};

describe('normalizing text', () => {
  it('ignores case and punctuation but keeps accents', () => {
    expect(normalizeText('¡Hola, CÓMO estás!')).toBe('hola cómo estás');
  });
  it('can also remove accents and tildes', () => {
    expect(foldAccents('¿Cómo estás, señor?')).toBe('como estas senor');
  });
});

describe('typed answers', () => {
  it('accepts an exact answer without a spelling note', () => {
    const result = gradeAnswer(listen, { kind: 'text', value: 'hola, ¿cómo estás?' });
    expect(result).toMatchObject({ correct: true, accentFix: false });
  });

  it('accepts missing accents and returns the correct spelling', () => {
    const result = gradeAnswer(listen, { kind: 'text', value: 'hola como estas' });
    expect(result).toEqual({
      correct: true,
      accentFix: true,
      canonical: 'Hola, ¿cómo estás?'
    });
  });

  it('accepts n for ñ in a typed blank and flags it', () => {
    const result = gradeAnswer(blank, { kind: 'text', value: 'anos' });
    expect(result).toMatchObject({
      correct: true,
      accentFix: true,
      canonical: 'Tengo diez años.'
    });
  });

  it('accepts the whole sentence in a typed blank', () => {
    const result = gradeAnswer(blank, { kind: 'text', value: 'Tengo diez años' });
    expect(result).toMatchObject({ correct: true, accentFix: false });
  });

  it('rejects wrong words', () => {
    expect(gradeAnswer(listen, { kind: 'text', value: 'hola amigo' }).correct).toBe(false);
  });
});

describe('match pairs', () => {
  it('is correct when every pair matches with no slips', () => {
    expect(
      gradeAnswer(pairs, {
        kind: 'pairs',
        value: [
          ['hola', 'hello'],
          ['adiós', 'goodbye']
        ],
        mismatches: 0
      }).correct
    ).toBe(true);
  });

  it('counts a mismatch along the way as wrong', () => {
    expect(
      gradeAnswer(pairs, {
        kind: 'pairs',
        value: [
          ['hola', 'hello'],
          ['adiós', 'goodbye']
        ],
        mismatches: 1
      }).correct
    ).toBe(false);
  });

  it('rejects incomplete or repeated pairs', () => {
    expect(
      gradeAnswer(pairs, {
        kind: 'pairs',
        value: [
          ['hola', 'hello'],
          ['hola', 'hello']
        ],
        mismatches: 0
      }).correct
    ).toBe(false);
  });
});
