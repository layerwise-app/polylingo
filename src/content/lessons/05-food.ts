import type { Lesson } from '../types';

export const food: Lesson = {
  id: 'food',
  title: 'Food',
  description: 'Order a meal, name your favorites, and ask for the check.',
  art: 'apple',
  vocabulary: [
    { es: 'la manzana', en: 'the apple' },
    { es: 'el pan', en: 'the bread' },
    { es: 'el queso', en: 'the cheese' },
    { es: 'el huevo', en: 'the egg' },
    { es: 'el agua', en: 'the water' },
    { es: 'el café', en: 'the coffee' },
    { es: 'la leche', en: 'the milk' },
    { es: 'el pollo', en: 'the chicken' },
    { es: 'el arroz', en: 'the rice' },
    { es: 'la sopa', en: 'the soup' },
    { es: 'pan', en: 'bread' },
    { es: 'queso', en: 'cheese' },
    { es: 'agua', en: 'water' },
    { es: 'café', en: 'coffee' },
    { es: 'leche', en: 'milk' },
    { es: 'pollo', en: 'chicken' },
    { es: 'arroz', en: 'rice' },
    { es: 'sopa', en: 'soup' },
    { es: 'manzana', en: 'apple' },
    { es: 'huevo', en: 'egg' },
    { es: 'quiero', en: 'I want' },
    { es: 'como', en: 'I eat' },
    { es: 'bebo', en: 'I drink' },
    { es: 'y', en: 'and' },
    { es: 'con', en: 'with' },
    { es: 'gusta', en: 'pleases' },
    { es: 'me gusta', en: 'I like' },
    { es: 'mucha', en: 'a lot of' },
    { es: 'hambre', en: 'hunger' },
    { es: 'cuenta', en: 'check, bill' }
  ],
  exercises: [
    {
      id: 'food-01',
      type: 'picture_choice',
      prompt: 'the apple',
      answer: 'la manzana',
      hint: 'It’s the round red fruit.',
      options: [
        { art: 'bread', es: 'el pan', en: 'the bread' },
        { art: 'apple', es: 'la manzana', en: 'the apple' },
        { art: 'cheese', es: 'el queso', en: 'the cheese' },
        { art: 'egg', es: 'el huevo', en: 'the egg' }
      ]
    },
    {
      id: 'food-02',
      type: 'match_pairs',
      hint: 'Café is easy, and pan is the word behind “pantry”.',
      pairs: [
        { es: 'el agua', en: 'the water' },
        { es: 'el café', en: 'the coffee' },
        { es: 'la leche', en: 'the milk' },
        { es: 'el pan', en: 'the bread' }
      ]
    },
    {
      id: 'food-03',
      type: 'listen_type',
      es: 'Quiero agua, por favor.',
      en: 'I want water, please.',
      hint: 'A polite order: “I want”, a drink, then “please”.'
    },
    {
      id: 'food-04',
      type: 'build_sentence',
      en: 'I eat bread and cheese.',
      es: 'Como pan y queso.',
      distractors: ['bebo', 'sopa'],
      hint: 'Here como means “I eat”, not “how”.'
    },
    {
      id: 'food-05',
      type: 'fill_blank',
      sentence: 'Yo ___ café.',
      answer: 'bebo',
      options: ['bebo', 'como', 'tengo'],
      en: 'I drink coffee.',
      hint: 'Think of “beverage” for the verb that means “I drink”.'
    },
    {
      id: 'food-06',
      type: 'picture_choice',
      prompt: 'the chicken',
      answer: 'el pollo',
      hint: 'In Spanish, double L usually sounds like a Y: “po-yo”.',
      options: [
        { art: 'rice', es: 'el arroz', en: 'the rice' },
        { art: 'soup', es: 'la sopa', en: 'the soup' },
        { art: 'egg', es: 'el huevo', en: 'the egg' },
        { art: 'chicken', es: 'el pollo', en: 'the chicken' }
      ]
    },
    {
      id: 'food-07',
      type: 'build_sentence',
      en: 'I like chicken with rice.',
      es: 'Me gusta el pollo con arroz.',
      distractors: ['quiero', 'sopa'],
      hint: '“I like” is two words in Spanish, and food takes “el” or “la”.'
    },
    {
      id: 'food-08',
      type: 'listen_type',
      es: 'Tengo mucha hambre.',
      en: 'I am very hungry.',
      hint: 'In Spanish you “have” hunger instead of being hungry.'
    },
    {
      id: 'food-09',
      type: 'fill_blank',
      sentence: 'La ___, por favor.',
      answer: 'cuenta',
      en: 'The check, please.',
      hint: 'What you ask the server for at the end of a meal. It starts with “cue”.'
    },
    {
      id: 'food-10',
      type: 'fill_blank',
      sentence: 'Quiero una ___ de pollo.',
      answer: 'sopa',
      options: ['sopa', 'agua', 'leche'],
      en: 'I want a chicken soup.',
      hint: 'Which of these could be made with chicken?'
    }
  ]
};
