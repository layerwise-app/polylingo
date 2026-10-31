import type { Lesson } from '../types';

export const directions: Lesson = {
  id: 'directions',
  title: 'Directions',
  description: 'Find the bathroom, the bank, and the way back to your hotel.',
  art: 'arrow-right',
  vocabulary: [
    { es: 'a la izquierda', en: 'to the left' },
    { es: 'a la derecha', en: 'to the right' },
    { es: 'todo recto', en: 'straight ahead' },
    { es: 'la esquina', en: 'the corner' },
    { es: 'a', en: 'to' },
    { es: 'izquierda', en: 'left' },
    { es: 'derecha', en: 'right' },
    { es: 'todo', en: 'all' },
    { es: 'recto', en: 'straight' },
    { es: 'esquina', en: 'corner' },
    { es: 'el banco', en: 'the bank' },
    { es: 'el hospital', en: 'the hospital' },
    { es: 'la calle', en: 'the street' },
    { es: 'el baño', en: 'the bathroom' },
    { es: 'la estación', en: 'the station' },
    { es: 'banco', en: 'bank' },
    { es: 'hospital', en: 'hospital' },
    { es: 'calle', en: 'street' },
    { es: 'baño', en: 'bathroom' },
    { es: 'estación', en: 'station' },
    { es: 'está', en: 'is (located)' },
    { es: 'en', en: 'in, on' },
    { es: 'cerca', en: 'near' },
    { es: 'lejos', en: 'far' },
    { es: 'aquí', en: 'here' },
    { es: 'gira', en: 'turn' },
    { es: 'sigue', en: 'continue' },
    { es: 'perdón', en: 'excuse me' }
  ],
  exercises: [
    {
      id: 'directions-01',
      type: 'picture_choice',
      prompt: 'to the left',
      answer: 'a la izquierda',
      hint: 'Find the arrow pointing left.',
      options: [
        { art: 'arrow-left', es: 'a la izquierda', en: 'to the left' },
        { art: 'arrow-right', es: 'a la derecha', en: 'to the right' },
        { art: 'arrow-up', es: 'todo recto', en: 'straight ahead' },
        { art: 'corner', es: 'la esquina', en: 'the corner' }
      ]
    },
    {
      id: 'directions-02',
      type: 'match_pairs',
      hint: 'Banco and hospital are close to English. A baño has a bathtub in it.',
      pairs: [
        { es: 'el banco', en: 'the bank' },
        { es: 'el hospital', en: 'the hospital' },
        { es: 'la calle', en: 'the street' },
        { es: 'el baño', en: 'the bathroom' }
      ]
    },
    {
      id: 'directions-03',
      type: 'listen_type',
      es: '¿Dónde está el baño?',
      en: 'Where is the bathroom?',
      hint: 'A very useful question: “where is” and then a place.'
    },
    {
      id: 'directions-04',
      type: 'build_sentence',
      en: 'Turn to the right.',
      es: 'Gira a la derecha.',
      distractors: ['izquierda', 'sigue'],
      hint: 'Derecha means “right”. Izquierda means “left”.'
    },
    {
      id: 'directions-05',
      type: 'fill_blank',
      sentence: 'Sigue todo ___.',
      answer: 'recto',
      options: ['recto', 'lejos', 'aquí'],
      en: 'Continue straight ahead.',
      hint: 'Think of “rectangle”, which has straight sides.'
    },
    {
      id: 'directions-06',
      type: 'picture_choice',
      prompt: 'the bank',
      answer: 'el banco',
      hint: 'Find the building with the dollar sign.',
      options: [
        { art: 'hospital', es: 'el hospital', en: 'the hospital' },
        { art: 'station', es: 'la estación', en: 'the station' },
        { art: 'bank', es: 'el banco', en: 'the bank' },
        { art: 'bathroom', es: 'el baño', en: 'the bathroom' }
      ]
    },
    {
      id: 'directions-07',
      type: 'build_sentence',
      en: 'The station is very far.',
      es: 'La estación está muy lejos.',
      distractors: ['cerca', 'banco'],
      hint: 'Use está for where something is located.'
    },
    {
      id: 'directions-08',
      type: 'listen_type',
      es: 'Perdón, ¿dónde está la estación?',
      en: 'Excuse me, where is the station?',
      hint: 'Start politely, then ask “where is” and a place.'
    },
    {
      id: 'directions-09',
      type: 'fill_blank',
      sentence: 'El hospital está ___ de aquí.',
      answer: 'cerca',
      en: 'The hospital is near here.',
      hint: 'The opposite of lejos. It starts with “cer”.'
    },
    {
      id: 'directions-10',
      type: 'fill_blank',
      sentence: 'El banco está en la ___.',
      answer: 'esquina',
      options: ['esquina', 'derecha', 'recto'],
      en: 'The bank is on the corner.',
      hint: 'Where two streets meet.'
    }
  ]
};
