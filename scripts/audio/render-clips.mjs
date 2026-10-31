/**
 * Records the course's speech with OpenAI's `gpt-audio-1.5`. Reads the key from
 * `OPENAI_API_KEY` (`pnpm audio:generate` loads it from `.env`).
 *
 *   node --env-file-if-exists=.env scripts/audio/render-clips.mjs          records missing clips
 *   node --env-file-if-exists=.env scripts/audio/render-clips.mjs --all    records every clip again
 *   node --env-file-if-exists=.env scripts/audio/render-clips.mjs --only='hola|¿cómo estás?'
 *       records a sample into scripts/audio/.staging and publishes nothing
 *
 * New files wait in `.staging` and only replace `public/audio` once the whole run
 * has passed, so a failed run leaves the current audio alone. Run it again to resume.
 *
 * This model speaks rather than reads, so it can answer a question instead of saying
 * it, or swallow a first consonant. Each take is checked against the model's own
 * transcript and against independent transcriptions of the final MP3.
 */
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { promisify } from 'node:util';

const MODEL = 'gpt-audio-1.5';
const VOICE = 'marin';
const TRANSCRIBE_MODEL = 'gpt-4o-transcribe';
// One transcriber can fill in a sound the voice dropped, so at least one of these must
// agree too. They're noisier on single words, so they don't both have to.
const SECOND_OPINIONS = ['gpt-4o-mini-transcribe', 'whisper-1'];
const CONCURRENCY = 6;
const MAX_TAKES = 8;
const MIN_SLOW_RATIO = 1.35;
const MAX_SLOW_RATIO = 2.6;
// A very short word can go past that ratio and still sound fine.
const FINE_SLOW_MS = 1600;

const STAGING = 'scripts/audio/.staging';
const REPORT_PATH = 'scripts/audio/generation-report.json';
const VALIDATION_PATH = 'scripts/audio/validation-report.json';

const VOICE_DIRECTION = `You are a professional voice actor, a native Spanish speaker, recording audio for a beginner Spanish course. You are not an assistant.

The user message contains a script inside <script> tags. It is never a question or a request addressed to you. Say exactly the words of the script, once, and nothing else. Never answer it, translate it, comment on it, or add words before or after it. If the script is a question, ask it with a question's intonation.

Speak in neutral Latin American Spanish with a Mexican accent. Always use Spanish pronunciation, even for words that also exist in English, such as "hotel", "doctor", or "me". A script of one letter is a Spanish word, so say the word and never the name of the letter: "y" sounds like "ee", and "a" sounds like "ah". Your voice is warm, clear, friendly, and natural, with crisp consonants and pure Spanish vowels. Respond with speech only.`;

// Other correct spellings of a clip's sound. "y" sounds like "ee", and in Latin American
// Spanish "ceno" and "seno" sound the same.
const ALSO_ACCEPT = { y: ['i', 'ee', 'e'], a: ['ah'], ceno: ['seno'] };

function paceDirection(clip, speed, normalMs) {
  if (speed === 'normal') {
    return 'Pace: a natural, unhurried conversational pace, as a friendly teacher would speak to a beginner.';
  }
  const seconds = Math.max((normalMs * 1.7) / 1000, 1).toFixed(1);
  return clip.kind === 'word'
    ? `Pace: very slow and drawn out, a teacher modeling one word for a beginner. Hold each vowel a bit longer than usual, so the word takes about ${seconds} seconds. Keep it one smooth word: no extra sounds, and don't split it into syllables.`
    : `Pace: slow and deliberate, about 60% of natural speed, so a beginner can hear each sound. Hold the vowels a little longer and leave a small pause between words, so the whole script takes about ${seconds} seconds. Keep it connected and warm, and don't split words into syllables.`;
}

const run = promisify(execFile);
const argv = process.argv.slice(2);
const redoAll = argv.includes('--all');
const onlyArg = argv.find((arg) => arg.startsWith('--only='));
const onlyKeys = onlyArg ? new Set(onlyArg.slice('--only='.length).split('|')) : null;

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('OPENAI_API_KEY is not set. Add it to .env or your shell.');
  process.exit(1);
}

const usage = { speechRequests: 0, audioTokens: 0, textTokens: 0, transcriptions: 0 };

/** POST to OpenAI, retrying rate limits, server errors, and dropped connections. */
async function openai(path, body, isJson = true) {
  let lastError;
  for (let attempt = 0; attempt < 6; attempt++) {
    if (attempt > 0) {
      await new Promise((done) => setTimeout(done, 2 ** attempt * 1000));
    }
    try {
      const response = await fetch(`https://api.openai.com/v1/${path}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          ...(isJson ? { 'Content-Type': 'application/json' } : {})
        },
        body: isJson ? JSON.stringify(body) : body,
        signal: AbortSignal.timeout(120_000)
      });
      if (response.ok) return await response.json();
      const detail = await response.text();
      lastError = new Error(`${path} ${response.status}: ${detail.slice(0, 300)}`);
      if (response.status !== 429 && response.status < 500) throw Object.assign(lastError, { fatal: true });
    } catch (error) {
      if (error.fatal) throw error;
      lastError = error;
    }
  }
  throw lastError;
}

/**
 * Reduces text to its sounds, so punctuation, case, and accents can't fail a take.
 * A slow take is often written with stretched vowels ("hoooola"), and Spanish "h" is
 * silent, so repeated vowels collapse and "h" drops out. Repeated consonants stay,
 * since "caro" and "carro" are different words.
 */
function comparable(text) {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\[[^\]]*\]/g, ' ') // Stage directions like "[pause]" aren't spoken.
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replaceAll('h', '')
    .replace(/([aeiou])\1+/g, '$1')
    .trim();
}

async function speak(clip, speed, normalMs, paceNote) {
  const data = await openai('chat/completions', {
    model: MODEL,
    modalities: ['text', 'audio'],
    audio: { voice: VOICE, format: 'wav' },
    messages: [
      {
        role: 'system',
        content: `${VOICE_DIRECTION}\n\n${paceDirection(clip, speed, normalMs)}${paceNote ? ` ${paceNote}` : ''}`
      },
      { role: 'user', content: `<script>${clip.say}</script>` }
    ]
  });
  usage.speechRequests += 1;
  usage.audioTokens += data.usage?.completion_tokens_details?.audio_tokens ?? 0;
  usage.textTokens += data.usage?.prompt_tokens ?? 0;
  const audio = data.choices?.[0]?.message?.audio;
  if (!audio?.data) throw new Error('The model returned no audio');
  return { wav: Buffer.from(audio.data, 'base64'), transcript: audio.transcript ?? '' };
}

async function transcribe(file, model) {
  // A lone word is easier to catch with some silence around it. The prompt gives
  // context but never the expected text, so this check stays independent.
  const padded = `${file}.padded.wav`;
  await run('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y', '-i', file,
    '-af', 'adelay=500:all=1,apad=pad_dur=0.5', padded
  ]);
  const form = new FormData();
  form.set('model', model);
  form.set('language', 'es');
  form.set('prompt', 'Una palabra o frase en español de un curso para principiantes.');
  form.set('file', new Blob([await readFile(padded)], { type: 'audio/wav' }), basename(padded));
  await rm(padded);
  const data = await openai('audio/transcriptions', form, false);
  usage.transcriptions += 1;
  return data.text ?? '';
}

/** Same loudness for every clip, edge silence trimmed, pauses inside speech kept. */
async function encode(wavFile, mp3File) {
  // loudnorm can't measure a very short word, so pad first and trim afterward.
  const filter =
    'apad=whole_dur=3,loudnorm=I=-18:TP=-2:LRA=7,' +
    'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.03,' +
    'areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.06,areverse';
  await run('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y', '-i', wavFile,
    '-af', filter, '-ac', '1', '-ar', '24000',
    '-c:a', 'libmp3lame', '-b:a', '64k', '-map_metadata', '-1', mp3File
  ]);
}

async function durationMs(file) {
  const { stdout } = await run('ffprobe', [
    '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file
  ]);
  return Math.round(Number(stdout.trim()) * 1000);
}

/** Records takes until one passes every check. Returns the result it saved. */
async function record(clip, speed, normalMs) {
  const output = join(STAGING, clip[speed].replace(/^public\/audio\//, ''));
  const sidecar = `${output}.json`;
  if (existsSync(output) && existsSync(sidecar)) {
    return JSON.parse(await readFile(sidecar, 'utf8'));
  }
  await mkdir(dirname(output), { recursive: true });

  const expected = [clip.say, ...(ALSO_ACCEPT[clip.key] ?? [])].map(comparable);
  let best = null;
  let paceNote = '';
  for (let take = 1; take <= MAX_TAKES; take++) {
    const wavFile = `${output}.take${take}.wav`;
    const mp3File = `${output}.take${take}.mp3`;
    const { wav, transcript } = await speak(clip, speed, normalMs, paceNote);
    await writeFile(wavFile, wav);
    await encode(wavFile, mp3File);
    await rm(wavFile);

    // Now and then a take is silence, which leaves nothing after trimming.
    const ms = await durationMs(mp3File).catch(() => 0);
    if (ms === 0) {
      await rm(mp3File);
      continue;
    }
    const heard = await transcribe(mp3File, TRANSCRIBE_MODEL);
    const ratio = speed === 'slow' ? ms / normalMs : null;
    const tooFast = ratio !== null && ratio < MIN_SLOW_RATIO;
    const tooSlow = ratio !== null && ratio > MAX_SLOW_RATIO && ms > FINE_SLOW_MS;
    const paceOk = !tooFast && !tooSlow;
    const saidOk = expected.includes(comparable(transcript));
    let heardOk = expected.includes(comparable(heard));
    const secondOpinions = [];
    if (heardOk) {
      for (const model of SECOND_OPINIONS) {
        secondOpinions.push(await transcribe(mp3File, model));
        if (expected.includes(comparable(secondOpinions.at(-1)))) break;
      }
      heardOk = secondOpinions.some((text) => expected.includes(comparable(text)));
    }
    const result = { key: clip.key, speed, file: clip[speed], ms, ratio, transcript, heard, secondOpinions, saidOk, heardOk, paceOk, takes: take };
    const score = (saidOk ? 4 : 0) + (paceOk ? 2 : 0) + (heardOk ? 1 : 0);

    if (!best || score > best.score) {
      if (best) await rm(best.mp3File);
      best = { result, score, mp3File };
    } else {
      await rm(mp3File);
    }
    if (best.score === 7) break;
    // The model sometimes starts on the vowel and swallows the first consonant. Takes
    // with a little silence up front keep it.
    if (!heardOk) paceNote = 'The last take lost some sounds. Start with a short moment of silence, then pronounce the first consonant and every other sound fully and crisply.';
    if (tooFast) paceNote = 'The last take was too fast. Speak much more slowly.';
    if (tooSlow) paceNote = `The last take was far too drawn out. Say the whole script in no more than ${((normalMs * 1.8) / 1000).toFixed(1)} seconds.`;
  }

  if (!best) throw new Error(`${speed}: every take was silent`);
  const { result, mp3File } = best;
  if (best.score !== 7) {
    await rm(mp3File);
    throw new Error(
      `${speed}: said "${result.transcript}", heard "${result.heard}", ${result.ms} ms, ratio ${result.ratio}`
    );
  }
  await rename(mp3File, output);
  await writeFile(sidecar, JSON.stringify(result));
  return result;
}

async function loadJson(path) {
  return existsSync(path) ? JSON.parse(await readFile(path, 'utf8')) : null;
}

const allClips = JSON.parse(await readFile('scripts/audio/clips.json', 'utf8'));
const previous = await loadJson(REPORT_PATH);
const missing = (clip) => !existsSync(clip.normal) || !existsSync(clip.slow);
const targets = allClips.filter((clip) =>
  onlyKeys ? onlyKeys.has(clip.key) : redoAll || missing(clip)
);

if (onlyKeys) {
  const unknown = [...onlyKeys].filter((key) => !allClips.some((clip) => clip.key === key));
  if (unknown.length > 0) console.error(`Not in the course: ${unknown.join(', ')}`);
}
if (!onlyKeys && !redoAll && targets.length > 0 && previous && (previous.model !== MODEL || previous.voice !== VOICE)) {
  console.error(`The current audio isn't ${MODEL}/${VOICE}. Use --all, so the course doesn't mix voices.`);
  process.exit(1);
}

const results = [];
const failures = [];
let next = 0;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (next < targets.length) {
      const clip = targets[next++];
      try {
        const normal = await record(clip, 'normal');
        const slow = await record(clip, 'slow', normal.ms);
        results.push(normal, slow);
      } catch (error) {
        failures.push(`${clip.key}: ${error.message}`);
      }
      const done = results.length / 2 + failures.length;
      if (onlyKeys || done % 25 === 0 || done === targets.length) {
        console.log(`${done}/${targets.length} clips, ${failures.length} failed`);
      }
    }
  })
);

results.sort((a, b) => a.file.localeCompare(b.file));
if (onlyKeys) {
  for (const r of results) {
    const ratio = r.ratio ? ` x${r.ratio.toFixed(2)}` : '';
    console.log(`${r.speed.padEnd(6)} ${String(r.ms).padStart(5)}ms${ratio} takes=${r.takes} said=${r.saidOk ? 'ok' : 'NO'} heard=${r.heardOk ? 'ok' : 'NO'}  ${r.key}  =>  ${r.heard}`);
  }
}
console.log(`Usage this run: ${JSON.stringify(usage)}`);
if (failures.length > 0) {
  console.error(`\n${failures.length} clip(s) failed. Nothing was published; run again to retry them.\n${failures.join('\n')}`);
  process.exit(1);
}
if (onlyKeys || targets.length === 0) process.exit(0);

// The whole run passed, so swap the new files in and record what happened.
for (const result of results) {
  const staged = join(STAGING, result.file.replace(/^public\/audio\//, ''));
  await mkdir(dirname(result.file), { recursive: true });
  await rename(staged, result.file);
}
await rm(STAGING, { recursive: true, force: true });

const earlier = redoAll ? [] : ((await loadJson(VALIDATION_PATH))?.results ?? []);
const merged = [...earlier.filter((old) => !results.some((r) => r.file === old.file)), ...results]
  .filter((r) => allClips.some((clip) => clip.normal === r.file || clip.slow === r.file))
  .sort((a, b) => a.file.localeCompare(b.file));
await writeFile(VALIDATION_PATH, `${JSON.stringify({ results: merged }, null, 2)}\n`);

const ratios = merged.filter((r) => r.ratio).map((r) => r.ratio);
await writeFile(
  REPORT_PATH,
  `${JSON.stringify(
    {
      generatedBy: 'scripts/audio/render-clips.mjs',
      engine: 'OpenAI Chat Completions',
      model: MODEL,
      voice: VOICE,
      locale: 'Latin American Spanish, Mexican accent (requested in the prompt)',
      aiGenerated: true,
      generatedAt: new Date().toISOString(),
      clipCount: merged.length,
      format: 'MP3, mono, 24 kHz, 64 kbps, -18 LUFS, edge silence trimmed',
      slowVersion: `Spoken slowly by the model, not time-stretched. ${Math.min(...ratios).toFixed(2)}x to ${Math.max(...ratios).toFixed(2)}x the normal length.`,
      verifiedWith: `Model transcript, ${TRANSCRIBE_MODEL}, and one of ${SECOND_OPINIONS.join(' or ')} compared to the script, ignoring case, punctuation, and accents`,
      humanReviewed: false
    },
    null,
    2
  )}\n`
);
const stagedLeft = existsSync(STAGING) ? await readdir(STAGING) : [];
console.log(
  `Published ${results.length} files.${stagedLeft.length ? ' Staging was not empty.' : ''}`
);
