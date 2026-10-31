import type { Lesson } from '../types';

export const travel: Lesson = {
  id: 'travel',
  title: 'Travel',
  description: 'Get to the airport, check in, and enjoy your trip.',
  art: 'plane',
  vocabulary: [
    { es: 'el avión', en: 'the plane' },
    { es: 'el tren', en: 'the train' },
    { es: 'el autobús', en: 'the bus' },
    { es: 'el pasaporte', en: 'the passport' },
    { es: 'la maleta', en: 'the suitcase' },
    { es: 'el boleto', en: 'the ticket' },
    { es: 'el hotel', en: 'the hotel' },
    { es: 'la playa', en: 'the beach' },
    { es: 'el aeropuerto', en: 'the airport' },
    { es: 'avión', en: 'plane' },
    { es: 'tren', en: 'train' },
    { es: 'autobús', en: 'bus' },
    { es: 'pasaporte', en: 'passport' },
    { es: 'maleta', en: 'suitcase' },
    { es: 'boleto', en: 'ticket' },
    { es: 'hotel', en: 'hotel' },
    { es: 'playa', en: 'beach' },
    { es: 'aeropuerto', en: 'airport' },
    { es: 'habitación', en: 'room' },
    { es: 'voy', en: 'I am going' },
    { es: 'al', en: 'to the' },
    { es: 'viajar', en: 'to travel' },
    { es: 'viaje', en: 'trip' },
    { es: 'buen', en: 'good' },
    { es: 'buen viaje', en: 'have a good trip' },
    { es: 'sale', en: 'leaves, departs' },
    { es: 'necesito', en: 'I need' }
  ],
  exercises: [
    {
      id: 'travel-01',
      type: 'picture_choice',
      prompt: 'the plane',
      answer: 'el avión',
      hint: 'Avión is related to “aviation”.',
      options: [
        { art: 'train', es: 'el tren', en: 'the train' },
        { art: 'bus', es: 'el autobús', en: 'the bus' },
        { art: 'plane', es: 'el avión', en: 'the plane' },
        { art: 'suitcase', es: 'la maleta', en: 'the suitcase' }
      ]
    },
    {
      id: 'travel-02',
      type: 'match_pairs',
      hint: 'Pasaporte is almost the same as in English. The playa has sand.',
      pairs: [
        { es: 'el pasaporte', en: 'the passport' },
        { es: 'la maleta', en: 'the suitcase' },
        { es: 'el boleto', en: 'the ticket' },
        { es: 'la playa', en: 'the beach' }
      ]
    },
    {
      id: 'travel-03',
      type: 'listen_type',
      es: 'Necesito mi pasaporte.',
      en: 'I need my passport.',
      hint: 'Necesito is close to “necessary”.'
    },
    {
      id: 'travel-04',
      type: 'build_sentence',
      en: 'I am going to the airport.',
      es: 'Voy al aeropuerto.',
      distractors: ['hotel', 'tren'],
      hint: 'Al is short for “a el”, meaning “to the”.'
    },
    {
      id: 'travel-05',
      type: 'fill_blank',
      sentence: '¿A qué hora ___ el tren?',
      answer: 'sale',
      options: ['sale', 'voy', 'quiero'],
      en: 'What time does the train leave?',
      hint: 'You’re asking when the train departs.'
    },
    {
      id: 'travel-06',
      type: 'picture_choice',
      prompt: 'the hotel',
      answer: 'el hotel',
      hint: 'It’s spelled the same as in English, but the H is silent.',
      options: [
        { art: 'beach', es: 'la playa', en: 'the beach' },
        { art: 'hotel', es: 'el hotel', en: 'the hotel' },
        { art: 'airport', es: 'el aeropuerto', en: 'the airport' },
        { art: 'ticket', es: 'el boleto', en: 'the ticket' }
      ]
    },
    {
      id: 'travel-07',
      type: 'build_sentence',
      en: 'I want a room, please.',
      es: 'Quiero una habitación, por favor.',
      distractors: ['maleta', 'voy'],
      hint: 'Habitación sounds like “habitation”, a place to stay.'
    },
    {
      id: 'travel-08',
      type: 'listen_type',
      es: 'Me gusta viajar en tren.',
      en: 'I like to travel by train.',
      hint: 'Start with “I like”, then “to travel”, then how you get there.'
    },
    {
      id: 'travel-09',
      type: 'fill_blank',
      sentence: 'Un ___ a Madrid, por favor.',
      answer: 'boleto',
      en: 'A ticket to Madrid, please.',
      hint: 'You buy it at the station. It starts with “bo”.'
    },
    {
      id: 'travel-10',
      type: 'listen_type',
      es: '¡Buen viaje!',
      en: 'Have a good trip!',
      hint: 'Something a friend shouts as you leave for the airport.'
    }
  ]
};
