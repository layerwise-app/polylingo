import type { Lesson } from '../types';

export const dailyRoutine: Lesson = {
  id: 'daily-routine',
  title: 'Daily Routine',
  description: 'Walk through your day, from the alarm clock to bedtime.',
  art: 'alarm',
  vocabulary: [
    { es: 'me despierto', en: 'I wake up' },
    { es: 'me ducho', en: 'I shower' },
    { es: 'me acuesto', en: 'I go to bed' },
    { es: 'despierto', en: 'I wake' },
    { es: 'ducho', en: 'I shower' },
    { es: 'acuesto', en: 'I lie down' },
    { es: 'desayuno', en: 'I eat breakfast' },
    { es: 'trabajo', en: 'I work' },
    { es: 'estudio', en: 'I study' },
    { es: 'ceno', en: 'I eat dinner' },
    { es: 'por la mañana', en: 'in the morning' },
    { es: 'por la noche', en: 'at night' },
    { es: 'mañana', en: 'morning, tomorrow' },
    { es: 'noche', en: 'night' },
    { es: 'temprano', en: 'early' },
    { es: 'tarde', en: 'late' },
    { es: 'cada', en: 'every, each' },
    { es: 'día', en: 'day' },
    { es: 'español', en: 'Spanish' }
  ],
  exercises: [
    {
      id: 'daily-routine-01',
      type: 'picture_choice',
      prompt: 'I shower',
      answer: 'me ducho',
      hint: 'Find the picture with water pouring down.',
      options: [
        { art: 'alarm', es: 'me despierto', en: 'I wake up' },
        { art: 'shower', es: 'me ducho', en: 'I shower' },
        { art: 'breakfast', es: 'desayuno', en: 'I eat breakfast' },
        { art: 'work', es: 'trabajo', en: 'I work' }
      ]
    },
    {
      id: 'daily-routine-02',
      type: 'match_pairs',
      hint: 'Desayuno breaks the fast, just like “breakfast”.',
      pairs: [
        { es: 'me despierto', en: 'I wake up' },
        { es: 'desayuno', en: 'I eat breakfast' },
        { es: 'trabajo', en: 'I work' },
        { es: 'ceno', en: 'I eat dinner' }
      ]
    },
    {
      id: 'daily-routine-03',
      type: 'listen_type',
      es: 'Me despierto temprano.',
      en: 'I wake up early.',
      hint: 'Temprano means “early” and is related to “temporary”.'
    },
    {
      id: 'daily-routine-04',
      type: 'build_sentence',
      en: 'I shower in the morning.',
      es: 'Me ducho por la mañana.',
      distractors: ['noche', 'ceno'],
      hint: '“In the morning” is “por la mañana”.'
    },
    {
      id: 'daily-routine-05',
      type: 'fill_blank',
      sentence: 'Por la noche, ___ con mi familia.',
      answer: 'ceno',
      options: ['ceno', 'desayuno', 'me despierto'],
      en: 'At night, I eat dinner with my family.',
      hint: 'Which meal do you eat at night?'
    },
    {
      id: 'daily-routine-06',
      type: 'picture_choice',
      prompt: 'I study',
      answer: 'estudio',
      hint: 'It looks like “studio”, a place where you work on your craft.',
      options: [
        { art: 'bed', es: 'me acuesto', en: 'I go to bed' },
        { art: 'dinner', es: 'ceno', en: 'I eat dinner' },
        { art: 'study', es: 'estudio', en: 'I study' },
        { art: 'shower', es: 'me ducho', en: 'I shower' }
      ]
    },
    {
      id: 'daily-routine-07',
      type: 'build_sentence',
      en: 'I work every day.',
      es: 'Trabajo cada día.',
      distractors: ['estudio', 'tarde'],
      hint: 'Cada día means “every day”.'
    },
    {
      id: 'daily-routine-08',
      type: 'listen_type',
      es: 'Me acuesto muy tarde.',
      en: 'I go to bed very late.',
      hint: 'Tarde can mean “afternoon”, and it also means “late”.'
    },
    {
      id: 'daily-routine-09',
      type: 'fill_blank',
      sentence: 'Yo ___ español por la mañana.',
      answer: 'estudio',
      en: 'I study Spanish in the morning.',
      hint: 'Take “study” and put an E at the front and -io at the end.'
    }
  ]
};
