import type { Lesson } from '../types';

export const introductions: Lesson = {
  id: 'introductions',
  title: 'Introductions',
  description: 'Share your name, where you’re from, and who your friends are.',
  art: 'friends',
  vocabulary: [
    { es: 'me llamo', en: 'my name is' },
    { es: 'te llamas', en: 'your name is' },
    { es: 'me', en: 'myself' },
    { es: 'te', en: 'yourself' },
    { es: 'llamo', en: 'I call' },
    { es: 'llamas', en: 'you call' },
    { es: 'yo', en: 'I' },
    { es: 'tú', en: 'you' },
    { es: 'él', en: 'he' },
    { es: 'ella', en: 'she' },
    { es: 'soy', en: 'I am' },
    { es: 'eres', en: 'you are' },
    { es: 'es', en: 'is' },
    { es: 'dónde', en: 'where' },
    { es: 'mi', en: 'my' },
    { es: 'el', en: 'the' },
    { es: 'la', en: 'the' },
    { es: 'el estudiante', en: 'the student' },
    { es: 'la maestra', en: 'the teacher' },
    { es: 'el amigo', en: 'the friend' },
    { es: 'el doctor', en: 'the doctor' },
    { es: 'estudiante', en: 'student' },
    { es: 'maestra', en: 'teacher' },
    { es: 'amigo', en: 'friend' },
    { es: 'amiga', en: 'friend (female)' },
    { es: 'doctor', en: 'doctor' },
    { es: 'estados', en: 'states' },
    { es: 'unidos', en: 'united' },
    { es: 'Estados Unidos', en: 'United States' },
    { es: 'Ana', en: 'Ana (a name)' },
    { es: 'Carlos', en: 'Carlos (a name)' },
    { es: 'Chicago', en: 'Chicago' }
  ],
  exercises: [
    {
      id: 'introductions-01',
      type: 'picture_choice',
      prompt: 'the student',
      answer: 'el estudiante',
      hint: 'Estudiante looks a lot like the English word.',
      options: [
        { art: 'student', es: 'el estudiante', en: 'the student' },
        { art: 'teacher', es: 'la maestra', en: 'the teacher' },
        { art: 'friends', es: 'el amigo', en: 'the friend' },
        { art: 'doctor', es: 'el doctor', en: 'the doctor' }
      ]
    },
    {
      id: 'introductions-02',
      type: 'match_pairs',
      hint: 'The accent matters: él means “he”, while el means “the”.',
      pairs: [
        { es: 'yo', en: 'I' },
        { es: 'tú', en: 'you' },
        { es: 'él', en: 'he' },
        { es: 'ella', en: 'she' }
      ]
    },
    {
      id: 'introductions-03',
      type: 'listen_type',
      es: 'Me llamo Ana.',
      en: 'My name is Ana.',
      hint: 'It’s literally “I call myself Ana”.'
    },
    {
      id: 'introductions-04',
      type: 'build_sentence',
      en: 'My name is Carlos.',
      es: 'Me llamo Carlos.',
      distractors: ['te', 'eres'],
      hint: 'Use “me” before the verb: “I call myself…”'
    },
    {
      id: 'introductions-05',
      type: 'fill_blank',
      sentence: 'Yo ___ de Chicago.',
      answer: 'soy',
      options: ['soy', 'eres', 'es'],
      en: 'I am from Chicago.',
      hint: 'You need the “I am” form of the verb.'
    },
    {
      id: 'introductions-06',
      type: 'build_sentence',
      en: 'Where are you from?',
      es: '¿De dónde eres?',
      distractors: ['soy', 'cómo'],
      hint: 'Spanish starts this one with “from”: “from where are you?”'
    },
    {
      id: 'introductions-07',
      type: 'fill_blank',
      sentence: '¿Cómo te ___?',
      answer: 'llamas',
      en: 'What is your name?',
      hint: 'It’s the “you” form of llamo, so it ends in -as.'
    },
    {
      id: 'introductions-08',
      type: 'listen_type',
      es: 'Soy de Estados Unidos.',
      en: 'I am from the United States.',
      hint: 'Listen for “I am from” and then a country name.'
    },
    {
      id: 'introductions-09',
      type: 'picture_choice',
      prompt: 'the teacher',
      answer: 'la maestra',
      hint: 'Find the person standing at the chalkboard.',
      options: [
        { art: 'friends', es: 'el amigo', en: 'the friend' },
        { art: 'doctor', es: 'el doctor', en: 'the doctor' },
        { art: 'teacher', es: 'la maestra', en: 'the teacher' },
        { art: 'student', es: 'el estudiante', en: 'the student' }
      ]
    },
    {
      id: 'introductions-10',
      type: 'fill_blank',
      sentence: 'Ella ___ mi amiga.',
      answer: 'es',
      options: ['es', 'soy', 'eres'],
      en: 'She is my friend.',
      hint: 'Use the form of “to be” that goes with he or she.'
    }
  ]
};
