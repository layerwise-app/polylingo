import type { Lesson } from '../types';

export const family: Lesson = {
  id: 'family',
  title: 'Family',
  description: 'Talk about your parents, siblings, and grandparents.',
  art: 'grandmother',
  vocabulary: [
    { es: 'la madre', en: 'the mother' },
    { es: 'el padre', en: 'the father' },
    { es: 'el hermano', en: 'the brother' },
    { es: 'la hermana', en: 'the sister' },
    { es: 'el abuelo', en: 'the grandfather' },
    { es: 'la abuela', en: 'the grandmother' },
    { es: 'el hijo', en: 'the son' },
    { es: 'la hija', en: 'the daughter' },
    { es: 'madre', en: 'mother' },
    { es: 'padre', en: 'father' },
    { es: 'padres', en: 'parents' },
    { es: 'hermano', en: 'brother' },
    { es: 'hermanos', en: 'brothers, siblings' },
    { es: 'hermana', en: 'sister' },
    { es: 'abuelo', en: 'grandfather' },
    { es: 'abuela', en: 'grandmother' },
    { es: 'hijo', en: 'son' },
    { es: 'hija', en: 'daughter' },
    { es: 'familia', en: 'family' },
    { es: 'mis', en: 'my (for more than one)' },
    { es: 'son', en: 'they are' },
    { es: 'una', en: 'a, an' },
    { es: 'un', en: 'a, an' },
    { es: 'se', en: 'himself, herself' },
    { es: 'llama', en: 'calls' },
    { es: 'se llama', en: 'is named' },
    { es: 'grande', en: 'big' },
    { es: 'pequeña', en: 'small' },
    { es: 'simpática', en: 'nice, friendly' },
    { es: 'simpáticos', en: 'nice, friendly' },
    { es: 'México', en: 'Mexico' },
    { es: 'Rosa', en: 'Rosa (a name)' }
  ],
  exercises: [
    {
      id: 'family-01',
      type: 'picture_choice',
      prompt: 'the mother',
      answer: 'la madre',
      hint: 'Words for women usually take “la”.',
      options: [
        { art: 'mother', es: 'la madre', en: 'the mother' },
        { art: 'father', es: 'el padre', en: 'the father' },
        { art: 'grandmother', es: 'la abuela', en: 'the grandmother' },
        { art: 'brother', es: 'el hermano', en: 'the brother' }
      ]
    },
    {
      id: 'family-02',
      type: 'match_pairs',
      hint: 'Hermano and hermana differ only in the last letter: -o for male, -a for female.',
      pairs: [
        { es: 'la madre', en: 'the mother' },
        { es: 'el padre', en: 'the father' },
        { es: 'el hermano', en: 'the brother' },
        { es: 'la hermana', en: 'the sister' }
      ]
    },
    {
      id: 'family-03',
      type: 'build_sentence',
      en: 'My family is big.',
      es: 'Mi familia es grande.',
      distractors: ['pequeña', 'mis'],
      hint: 'Grande comes after the verb, just like in English.'
    },
    {
      id: 'family-04',
      type: 'listen_type',
      es: 'Tengo una hermana.',
      en: 'I have a sister.',
      hint: 'Listen for “I have” and a word ending in -a.'
    },
    {
      id: 'family-05',
      type: 'fill_blank',
      sentence: 'Mi ___ se llama Rosa.',
      answer: 'madre',
      options: ['madre', 'padre', 'hermano'],
      en: 'My mother is named Rosa.',
      hint: 'Check the English translation below the sentence.'
    },
    {
      id: 'family-06',
      type: 'picture_choice',
      prompt: 'the grandfather',
      answer: 'el abuelo',
      hint: 'Abuelo is male and abuela is female.',
      options: [
        { art: 'grandmother', es: 'la abuela', en: 'the grandmother' },
        { art: 'grandfather', es: 'el abuelo', en: 'the grandfather' },
        { art: 'daughter', es: 'la hija', en: 'the daughter' },
        { art: 'father', es: 'el padre', en: 'the father' }
      ]
    },
    {
      id: 'family-07',
      type: 'build_sentence',
      en: 'My grandmother is very nice.',
      es: 'Mi abuela es muy simpática.',
      distractors: ['abuelo', 'grande'],
      hint: 'Muy means “very” and goes right before the describing word.'
    },
    {
      id: 'family-08',
      type: 'listen_type',
      es: 'Mis padres son de México.',
      en: 'My parents are from Mexico.',
      hint: 'Padres means “parents” here, not “fathers”.'
    },
    {
      id: 'family-09',
      type: 'fill_blank',
      sentence: 'Él es mi ___.',
      answer: 'hijo',
      en: 'He is my son.',
      hint: 'It has four letters and starts with a silent H.'
    },
    {
      id: 'family-10',
      type: 'fill_blank',
      sentence: 'Mis hermanos ___ simpáticos.',
      answer: 'son',
      options: ['son', 'es', 'soy'],
      en: 'My brothers are nice.',
      hint: 'There’s more than one brother, so use “they are”.'
    }
  ]
};
