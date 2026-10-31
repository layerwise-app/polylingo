import type { Lesson } from '../types';

export const numbers: Lesson = {
  id: 'numbers',
  title: 'Numbers',
  description: 'Count from one to ten and say how old you are.',
  art: 'count-3',
  vocabulary: [
    { es: 'uno', en: 'one' },
    { es: 'dos', en: 'two' },
    { es: 'tres', en: 'three' },
    { es: 'cuatro', en: 'four' },
    { es: 'cinco', en: 'five' },
    { es: 'seis', en: 'six' },
    { es: 'siete', en: 'seven' },
    { es: 'ocho', en: 'eight' },
    { es: 'nueve', en: 'nine' },
    { es: 'diez', en: 'ten' },
    { es: 'tengo', en: 'I have' },
    { es: 'tienes', en: 'you have' },
    { es: 'años', en: 'years' },
    { es: 'cuántos', en: 'how many' },
    { es: 'hay', en: 'there is, there are' },
    { es: 'libros', en: 'books' },
    { es: 'gatos', en: 'cats' }
  ],
  exercises: [
    {
      id: 'numbers-01',
      type: 'picture_choice',
      prompt: 'three',
      answer: 'tres',
      hint: 'Count the dots on each card.',
      options: [
        { art: 'count-1', es: 'uno', en: 'one' },
        { art: 'count-3', es: 'tres', en: 'three' },
        { art: 'count-5', es: 'cinco', en: 'five' },
        { art: 'count-8', es: 'ocho', en: 'eight' }
      ]
    },
    {
      id: 'numbers-02',
      type: 'match_pairs',
      hint: 'Tres sounds close to “three”, and dos is like “duo”.',
      pairs: [
        { es: 'uno', en: 'one' },
        { es: 'dos', en: 'two' },
        { es: 'tres', en: 'three' },
        { es: 'cuatro', en: 'four' },
        { es: 'cinco', en: 'five' }
      ]
    },
    {
      id: 'numbers-03',
      type: 'listen_type',
      es: 'Tengo diez años.',
      en: 'I am ten years old.',
      accept: ['Tengo 10 años.'],
      hint: 'In Spanish you “have” your age: “I have ten years”.'
    },
    {
      id: 'numbers-04',
      type: 'build_sentence',
      en: 'I have two cats.',
      es: 'Tengo dos gatos.',
      distractors: ['tres', 'libros'],
      hint: 'You don’t need a separate word for “I”. Tengo already means “I have”.'
    },
    {
      id: 'numbers-05',
      type: 'fill_blank',
      sentence: 'Seis, siete, ___, nueve.',
      answer: 'ocho',
      options: ['ocho', 'cinco', 'diez'],
      en: 'Six, seven, eight, nine.',
      hint: 'Which number comes right after seven?'
    },
    {
      id: 'numbers-06',
      type: 'match_pairs',
      hint: 'Siete and “seven” both start with S, and diez is the last number.',
      pairs: [
        { es: 'seis', en: 'six' },
        { es: 'siete', en: 'seven' },
        { es: 'ocho', en: 'eight' },
        { es: 'nueve', en: 'nine' },
        { es: 'diez', en: 'ten' }
      ]
    },
    {
      id: 'numbers-07',
      type: 'picture_choice',
      prompt: 'nine',
      answer: 'nueve',
      hint: 'Find the card with nine dots.',
      options: [
        { art: 'count-6', es: 'seis', en: 'six' },
        { art: 'count-7', es: 'siete', en: 'seven' },
        { art: 'count-9', es: 'nueve', en: 'nine' },
        { art: 'count-10', es: 'diez', en: 'ten' }
      ]
    },
    {
      id: 'numbers-08',
      type: 'listen_type',
      es: '¿Cuántos años tienes?',
      en: 'How old are you?',
      hint: 'It’s literally “how many years do you have?”'
    },
    {
      id: 'numbers-09',
      type: 'fill_blank',
      sentence: 'Hay ___ libros.',
      answer: 'cuatro',
      en: 'There are four books.',
      hint: 'Spell out the number 4. It starts with “cua”.'
    },
    {
      id: 'numbers-10',
      type: 'build_sentence',
      en: 'There are seven books.',
      es: 'Hay siete libros.',
      distractors: ['ocho', 'gatos'],
      hint: 'Hay means both “there is” and “there are”. The H is silent.'
    }
  ]
};
