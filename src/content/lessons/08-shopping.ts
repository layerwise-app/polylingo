import type { Lesson } from '../types';

export const shopping: Lesson = {
  id: 'shopping',
  title: 'Shopping',
  description: 'Ask what things cost, and pick clothes that fit your budget.',
  art: 'bag',
  vocabulary: [
    { es: 'la camisa', en: 'the shirt' },
    { es: 'los zapatos', en: 'the shoes' },
    { es: 'el vestido', en: 'the dress' },
    { es: 'el sombrero', en: 'the hat' },
    { es: 'la bolsa', en: 'the bag' },
    { es: 'el dinero', en: 'the money' },
    { es: 'la tienda', en: 'the store' },
    { es: 'camisa', en: 'shirt' },
    { es: 'zapatos', en: 'shoes' },
    { es: 'vestido', en: 'dress' },
    { es: 'sombrero', en: 'hat' },
    { es: 'bolsa', en: 'bag' },
    { es: 'dinero', en: 'money' },
    { es: 'tienda', en: 'store' },
    { es: 'los', en: 'the (for more than one)' },
    { es: 'barato', en: 'cheap' },
    { es: 'baratos', en: 'cheap' },
    { es: 'caro', en: 'expensive' },
    { es: 'cuánto', en: 'how much' },
    { es: 'cuesta', en: 'costs' },
    { es: 'dólares', en: 'dollars' },
    { es: 'pagar', en: 'to pay' },
    { es: 'tarjeta', en: 'card' },
    { es: 'quisiera', en: 'I would like' },
    { es: 'este', en: 'this' }
  ],
  exercises: [
    {
      id: 'shopping-01',
      type: 'picture_choice',
      prompt: 'the shirt',
      answer: 'la camisa',
      hint: 'Camisa sounds a bit like “chemise”, a kind of shirt.',
      options: [
        { art: 'shoes', es: 'los zapatos', en: 'the shoes' },
        { art: 'dress', es: 'el vestido', en: 'the dress' },
        { art: 'shirt', es: 'la camisa', en: 'the shirt' },
        { art: 'hat', es: 'el sombrero', en: 'the hat' }
      ]
    },
    {
      id: 'shopping-02',
      type: 'match_pairs',
      hint: 'Barato and caro are opposites. Caro is the pricey one.',
      pairs: [
        { es: 'la tienda', en: 'the store' },
        { es: 'el dinero', en: 'the money' },
        { es: 'barato', en: 'cheap' },
        { es: 'caro', en: 'expensive' }
      ]
    },
    {
      id: 'shopping-03',
      type: 'listen_type',
      es: '¿Cuánto cuesta la camisa?',
      en: 'How much does the shirt cost?',
      hint: 'Listen for “how much” and “costs”, then a piece of clothing.'
    },
    {
      id: 'shopping-04',
      type: 'build_sentence',
      en: 'The dress is very expensive.',
      es: 'El vestido es muy caro.',
      distractors: ['barato', 'camisa'],
      hint: 'Vestido sounds like “vest”, but it means “dress”.'
    },
    {
      id: 'shopping-05',
      type: 'fill_blank',
      sentence: 'Quiero pagar con ___.',
      answer: 'tarjeta',
      options: ['tarjeta', 'tienda', 'bolsa'],
      en: 'I want to pay with a card.',
      hint: 'You can swipe or tap it at the register.'
    },
    {
      id: 'shopping-06',
      type: 'picture_choice',
      prompt: 'the shoes',
      answer: 'los zapatos',
      hint: 'They go on your feet, and “los” tells you there’s more than one.',
      options: [
        { art: 'hat', es: 'el sombrero', en: 'the hat' },
        { art: 'shoes', es: 'los zapatos', en: 'the shoes' },
        { art: 'bag', es: 'la bolsa', en: 'the bag' },
        { art: 'money', es: 'el dinero', en: 'the money' }
      ]
    },
    {
      id: 'shopping-07',
      type: 'build_sentence',
      en: 'I would like this hat.',
      es: 'Quisiera este sombrero.',
      distractors: ['quiero', 'vestido'],
      hint: 'Quisiera is a polite way to say “I would like”.'
    },
    {
      id: 'shopping-08',
      type: 'listen_type',
      es: 'La bolsa cuesta diez dólares.',
      en: 'The bag costs ten dollars.',
      accept: ['La bolsa cuesta 10 dólares.'],
      hint: 'Listen for a number from lesson three, then “dollars”.'
    },
    {
      id: 'shopping-09',
      type: 'fill_blank',
      sentence: 'Los zapatos son muy ___.',
      answer: 'baratos',
      en: 'The shoes are very cheap.',
      hint: 'Use the plural of barato, because zapatos is plural.'
    }
  ]
};
