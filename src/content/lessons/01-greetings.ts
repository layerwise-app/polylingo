import type { Lesson } from '../types';

export const greetings: Lesson = {
  id: 'greetings',
  title: 'Greetings',
  description: 'Say hello, say goodbye, and ask how someone is doing.',
  art: 'wave',
  vocabulary: [
    { es: 'hola', en: 'hello' },
    { es: 'buenos días', en: 'good morning' },
    { es: 'buenas tardes', en: 'good afternoon' },
    { es: 'buenas noches', en: 'good evening' },
    { es: 'adiós', en: 'goodbye' },
    { es: 'gracias', en: 'thank you' },
    { es: 'por favor', en: 'please' },
    { es: 'de nada', en: 'you’re welcome' },
    { es: 'hasta luego', en: 'see you later' },
    { es: 'mucho gusto', en: 'nice to meet you' },
    { es: 'cómo', en: 'how' },
    { es: 'estás', en: 'you are' },
    { es: 'muy', en: 'very' },
    { es: 'bien', en: 'well' },
    { es: 'buenos', en: 'good' },
    { es: 'buenas', en: 'good' },
    { es: 'días', en: 'days' },
    { es: 'tardes', en: 'afternoons' },
    { es: 'noches', en: 'nights' },
    { es: 'por', en: 'for' },
    { es: 'favor', en: 'favor' },
    { es: 'de', en: 'of, from' },
    { es: 'nada', en: 'nothing' },
    { es: 'hasta', en: 'until' },
    { es: 'luego', en: 'later' },
    { es: 'mucho', en: 'much, a lot' },
    { es: 'gusto', en: 'pleasure' }
  ],
  exercises: [
    {
      id: 'greetings-01',
      type: 'picture_choice',
      prompt: 'good morning',
      answer: 'buenos días',
      hint: 'Look for the picture of the sun coming up.',
      options: [
        { art: 'sunrise', es: 'buenos días', en: 'good morning' },
        { art: 'afternoon', es: 'buenas tardes', en: 'good afternoon' },
        { art: 'moon', es: 'buenas noches', en: 'good evening' },
        { art: 'wave', es: 'hola', en: 'hello' }
      ]
    },
    {
      id: 'greetings-02',
      type: 'match_pairs',
      hint: 'Hola sounds like “oh-la”. The H is silent in Spanish.',
      pairs: [
        { es: 'hola', en: 'hello' },
        { es: 'adiós', en: 'goodbye' },
        { es: 'gracias', en: 'thank you' },
        { es: 'por favor', en: 'please' }
      ]
    },
    {
      id: 'greetings-03',
      type: 'listen_type',
      es: 'Hola, ¿cómo estás?',
      en: 'Hello, how are you?',
      hint: 'First a greeting, then a question meaning “how are you?”'
    },
    {
      id: 'greetings-04',
      type: 'build_sentence',
      en: 'Good morning, how are you?',
      es: 'Buenos días, ¿cómo estás?',
      distractors: ['noches', 'adiós'],
      hint: '“Good morning” is literally “good days” in Spanish.'
    },
    {
      id: 'greetings-05',
      type: 'fill_blank',
      sentence: '___ días, ¿cómo estás?',
      answer: 'Buenos',
      options: ['Buenos', 'Buenas', 'Hola'],
      en: 'Good morning, how are you?',
      hint: 'Días is masculine, so “good” ends in -os here.'
    },
    {
      id: 'greetings-06',
      type: 'fill_blank',
      sentence: 'Muy bien, ___.',
      answer: 'gracias',
      options: ['gracias', 'adiós', 'hola'],
      en: 'Very well, thank you.',
      hint: 'Someone asked how you are. Be polite and thank them.'
    },
    {
      id: 'greetings-07',
      type: 'picture_choice',
      prompt: 'thank you',
      answer: 'gracias',
      hint: 'What would you say when someone hands you a gift?',
      options: [
        { art: 'gift', es: 'gracias', en: 'thank you' },
        { art: 'wave', es: 'hola', en: 'hello' },
        { art: 'moon', es: 'buenas noches', en: 'good evening' },
        { art: 'sunrise', es: 'buenos días', en: 'good morning' }
      ]
    },
    {
      id: 'greetings-08',
      type: 'build_sentence',
      en: 'Thank you, see you later.',
      es: 'Gracias, hasta luego.',
      distractors: ['hola', 'tardes'],
      hint: '“See you later” is literally “until later”.'
    },
    {
      id: 'greetings-09',
      type: 'listen_type',
      es: 'Mucho gusto.',
      en: 'Nice to meet you.',
      hint: 'Two words you say when you meet someone new.'
    },
    {
      id: 'greetings-10',
      type: 'fill_blank',
      sentence: 'De ___.',
      answer: 'nada',
      en: 'You’re welcome.',
      hint: 'It’s literally “of nothing”. The word has four letters.'
    }
  ]
};
