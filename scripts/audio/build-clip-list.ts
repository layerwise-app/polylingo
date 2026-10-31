/**
 * Writes `scripts/audio/clips.json`: one entry per Spanish word or sentence in
 * the course, with the two files each one needs. Run after editing the course.
 */
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { lessons } from '../../src/content/course';
import { collectSpeech } from '../../src/content/speech';

// Text to say instead of the course's spelling, for a clip the voice gets wrong.
const spokenOverrides: Record<string, string> = {};

function fileStem(key: string): string {
  const slug = key
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  const hash = createHash('sha1').update(key).digest('hex').slice(0, 8);
  return `${slug || 'clip'}-${hash}`;
}

const clips = collectSpeech(lessons).map((clip) => ({
  key: clip.key,
  text: clip.text,
  say: spokenOverrides[clip.key] ?? clip.text,
  kind: clip.kind,
  lessons: clip.lessons,
  normal: `public/audio/normal/${fileStem(clip.key)}.mp3`,
  slow: `public/audio/slow/${fileStem(clip.key)}.mp3`
}));

writeFileSync(
  'scripts/audio/clips.json',
  `${JSON.stringify(clips, null, 2)}\n`
);
console.log(
  `${clips.length} clips: ${clips.filter((clip) => clip.kind === 'sentence').length} sentences and phrases, ${clips.filter((clip) => clip.kind === 'word').length} words`
);
