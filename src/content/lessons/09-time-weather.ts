import type { Lesson } from '../types';

export const timeWeather: Lesson = {
  id: 'time-weather',
  title: 'Time & Weather',
  description: 'Tell the time and make small talk about today’s weather.',
  art: 'cloud',
  vocabulary: [
    { es: 'qué', en: 'what' },
    { es: 'hora', en: 'hour, time' },
    { es: 'las', en: 'the (for more than one)' },
    { es: 'media', en: 'half' },
    { es: 'hoy', en: 'today' },
    { es: 'hace', en: 'it makes (used for weather)' },
    { es: 'hace calor', en: 'it is hot' },
    { es: 'hace frío', en: 'it is cold' },
    { es: 'hace sol', en: 'it is sunny' },
    { es: 'hace viento', en: 'it is windy' },
    { es: 'calor', en: 'heat' },
    { es: 'frío', en: 'cold' },
    { es: 'sol', en: 'sun' },
    { es: 'viento', en: 'wind' },
    { es: 'llueve', en: 'it is raining' },
    { es: 'nieva', en: 'it is snowing' },
    { es: 'está nublado', en: 'it is cloudy' },
    { es: 'nublado', en: 'cloudy' },
    { es: 'es la una', en: 'it is one o’clock' },
    { es: 'enero', en: 'January' },
    { es: 'Madrid', en: 'Madrid' }
  ],
  exercises: [
    {
      id: 'time-weather-01',
      type: 'picture_choice',
      prompt: 'it is raining',
      answer: 'llueve',
      hint: 'Llueve sounds like “you-EH-veh”. Look for the umbrella weather.',
      options: [
        { art: 'snow', es: 'nieva', en: 'it is snowing' },
        { art: 'rain', es: 'llueve', en: 'it is raining' },
        { art: 'sun', es: 'hace sol', en: 'it is sunny' },
        { art: 'wind', es: 'hace viento', en: 'it is windy' }
      ]
    },
    {
      id: 'time-weather-02',
      type: 'match_pairs',
      hint: 'Calor sounds like “calorie”, which is a unit of heat.',
      pairs: [
        { es: 'hace calor', en: 'it is hot' },
        { es: 'hace frío', en: 'it is cold' },
        { es: 'hoy', en: 'today' },
        { es: 'mañana', en: 'tomorrow' }
      ]
    },
    {
      id: 'time-weather-03',
      type: 'listen_type',
      es: '¿Qué hora es?',
      en: 'What time is it?',
      hint: 'It’s literally “what hour is it?”'
    },
    {
      id: 'time-weather-04',
      type: 'build_sentence',
      en: 'It is three o’clock.',
      es: 'Son las tres.',
      distractors: ['la', 'dos'],
      hint: 'Above one o’clock, Spanish uses the plural: “they are the three”.'
    },
    {
      id: 'time-weather-05',
      type: 'fill_blank',
      sentence: 'Hoy ___ mucho frío.',
      answer: 'hace',
      options: ['hace', 'es', 'hay'],
      en: 'Today it is very cold.',
      hint: 'Spanish weather often uses “it makes”: “it makes cold”.'
    },
    {
      id: 'time-weather-06',
      type: 'picture_choice',
      prompt: 'it is cloudy',
      answer: 'está nublado',
      hint: 'Look for the gray sky. Nublado comes from nube, “cloud”.',
      options: [
        { art: 'cloud', es: 'está nublado', en: 'it is cloudy' },
        { art: 'snow', es: 'nieva', en: 'it is snowing' },
        { art: 'hot', es: 'hace calor', en: 'it is hot' },
        { art: 'clock', es: 'es la una', en: 'it is one o’clock' }
      ]
    },
    {
      id: 'time-weather-07',
      type: 'build_sentence',
      en: 'It is very sunny today.',
      es: 'Hoy hace mucho sol.',
      accept: ['Hace mucho sol hoy.'],
      distractors: ['viento', 'mañana'],
      hint: 'Literally “today it makes a lot of sun”.'
    },
    {
      id: 'time-weather-08',
      type: 'listen_type',
      es: 'Es la una y media.',
      en: 'It is one thirty.',
      hint: 'One o’clock uses “es la”, then “and a half”.'
    },
    {
      id: 'time-weather-09',
      type: 'fill_blank',
      sentence: 'En enero ___ en Chicago.',
      answer: 'nieva',
      en: 'In January it snows in Chicago.',
      hint: 'A five-letter word related to “Nevada”, which means “snow-covered”.'
    },
    {
      id: 'time-weather-10',
      type: 'listen_type',
      es: 'Hace mucho viento hoy.',
      en: 'It is very windy today.',
      hint: 'Viento sounds like “vent”, a place where air blows.'
    }
  ]
};
