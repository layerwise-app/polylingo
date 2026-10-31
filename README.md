# Polylingo

A language learning SaaS template for Americans learning Spanish. It has a
winding lesson path, five exercise types, hearts, XP, streaks, a weekly
leaderboard, a free guest lesson, and accounts. Everything that makes it look
like one brand, and everything that makes it teach one course, is plain editable
data.

Built with TanStack Start, React, Tailwind CSS, Better Auth, and D1 with Drizzle,
on Cloudflare Workers through Layerwise.

```bash
pnpm dev             # start locally (Layerwise runs this for you)
pnpm check-types     # TypeScript
pnpm test            # game rules, grading, course checks, audio coverage
pnpm build           # production build
pnpm audio:generate  # record any missing speech clips and rebuild the manifest
pnpm brand:assets    # redraw the favicons and share image from the brand config
pnpm test:e2e        # play the whole product in a browser (see "Testing")
```

## Rebrand it

Open **`src/brand.config.tsx`**. This one file holds the name, tagline, language
label, support email, all colors, and the mascot.

1. Change `name`, `tagline`, `description`, `language`, and `supportEmail`.
2. Change `colors`. Each main color has a darker partner for the "lip" under 3D
   buttons (`primary` and `primaryDark`) and a pale tint (`primarySoft`). The app
   reads these as CSS variables, so nothing else needs editing.
3. Change the mascot:
   - For a recolor, edit `mascotPalette`.
   - For a new name, edit `mascot.name` and `mascot.description`.
   - For a new character, replace `drawMascot`. It receives a pose (`idle`,
     `wave`, `cheer`, `sad`, `think`, `sleep`, `talk`) and draws SVG in a 200 x
     200 box. All the artwork is original and has no outside assets.
4. Run `pnpm brand:assets` to redraw the favicons, app icons, and
   `public/og-image.png`.

Landing page wording is in `src/routes/index.tsx`, and it pulls the name and
mascot from the config. Set `url` in `src/lib/site.ts` once you connect a custom
domain.

## Edit the course

Each lesson is one file in **`src/content/lessons/`**. The learning path order is
the list in `src/content/course.ts`. Types and comments for every field are in
`src/content/types.ts`.

A lesson has an `id`, a `title`, a `description`, `art`, `vocabulary`, and 8 to 10
`exercises`. There are five exercise types:

```ts
// Which one means "the apple"? Four pictures.
{
  id: 'food-01',
  type: 'picture_choice',
  prompt: 'the apple',
  answer: 'la manzana',
  hint: 'It’s the round red fruit.',
  options: [
    { art: 'apple', es: 'la manzana', en: 'the apple' },
    { art: 'bread', es: 'el pan', en: 'the bread' },
    { art: 'cheese', es: 'el queso', en: 'the cheese' },
    { art: 'egg', es: 'el huevo', en: 'the egg' }
  ]
}

// Translate by tapping tiles. The tiles come from `es` plus `distractors`.
{
  id: 'food-04',
  type: 'build_sentence',
  en: 'I eat bread and cheese.',
  es: 'Como pan y queso.',
  distractors: ['bebo', 'sopa'],
  hint: 'Here como means “I eat”, not “how”.'
}

// Hear it, type it. `accept` lists other correct spellings.
{
  id: 'food-03',
  type: 'listen_type',
  es: 'Quiero agua, por favor.',
  en: 'I want water, please.',
  hint: 'A polite order.'
}

// Tap Spanish and English tiles to pair them.
{
  id: 'food-02',
  type: 'match_pairs',
  hint: 'Café is easy.',
  pairs: [
    { es: 'el agua', en: 'the water' },
    { es: 'el café', en: 'the coffee' }
  ]
}

// Fill the blank. With `options` the learner taps; without them, they type.
{
  id: 'food-05',
  type: 'fill_blank',
  sentence: 'Yo ___ café.',
  answer: 'bebo',
  options: ['bebo', 'como', 'tengo'],
  en: 'I drink coffee.',
  hint: 'Think of “beverage”.'
}
```

After editing:

1. Add any new Spanish word to the lesson's `vocabulary`, so tapping it shows a
   translation.
2. Add any new picture to `src/components/art/illustrations.tsx`, and use its key
   as `art`.
3. Run `pnpm audio:generate` to record any new text. It only generates what's missing,
   and it removes clips the course no longer uses.
4. Run `pnpm test`. It fails on a missing translation, picture, or clip, a lesson
   outside 8 to 10 exercises, a duplicate id, or an answer that can't be reached.

Keep lesson and exercise `id`s stable after launch, because learners' progress and
mistakes are stored against them. Removing an exercise is safe: attempts that
included it restart.

XP, hearts, goals, practice size, and leaderboard size are in
`src/config/game.ts`. Achievements are in `src/content/achievements.ts`.

## Audio

No speech is generated at runtime. Every Spanish word and sentence in the course
has a normal and a slow MP3 in `public/audio/`, and the app finds them through
`public/audio/manifest.json`. The clip text comes straight from the course data
(`src/content/speech.ts`).

`pnpm audio:generate` does three things:

1. Writes `scripts/audio/clips.json`, the list of clips the course needs.
2. Records anything missing with OpenAI (`scripts/audio/render-clips.mjs`). This needs
   `OPENAI_API_KEY` in `.env` or your shell, and `ffmpeg`.
3. Checks every file with `ffprobe` and writes the manifest. It refuses to write one
   if a clip is missing, broken, or not clearly slower than its normal version.

To record the whole course again, run `pnpm audio:render --all`, then
`pnpm audio:manifest`. New files replace the old ones only after the entire run passes.
If a run fails, run it again to resume.

**The voice.** `gpt-audio-1.5` with the `marin` voice, directed to use a neutral Latin
American Spanish accent. The slow versions are spoken slowly by the model, not stretched
afterward. `scripts/audio/generation-report.json` records what was used.

**Checks.** This model can answer a question instead of saying it, or swallow a first
consonant, so each take is compared to the script: the model's own transcript,
`gpt-4o-transcribe` on the final MP3, and at least one of `gpt-4o-mini-transcribe` or
`whisper-1`. A take that fails, or has the wrong pace, is recorded again, and a clip
that never passes stops the run. The
results are in `scripts/audio/validation-report.json`. These checks catch wrong words,
not an unnatural accent, so have a Spanish speaker listen before you launch.

**Fixing one clip.** Delete its two files and run `pnpm audio:generate`. If the voice
keeps misreading it, add the text it should say to `spokenOverrides` in
`scripts/audio/build-clip-list.ts`.

**Disclosure.** OpenAI requires telling listeners that the voice is AI-generated. The
note comes from `voiceDisclosure` in `src/config/game.ts` and appears in lessons, on the
landing page, and in settings. Keep it if you keep this audio.

## How the game works

The browser never decides a score. The server in `src/server/engine.ts` grades each
answer and calculates everything else. The rules themselves are pure, unit-tested
functions in `src/lib/grading.ts` and `src/lib/game-rules.ts`.

- **Lessons** are server-side attempts with a queue of exercises. A wrong answer adds
  that exercise to the end of the queue. Quitting or reloading resumes from the same
  place.
- **Hearts**: 5 at most, one lost per mistake, one back every hour. At zero, lessons
  stop until a heart refills or the learner earns one in practice.
- **Typed answers** ignore case and punctuation. Missing accents still count as
  correct, including `n` for `ñ`, and the feedback shows the correct spelling.
- **Streaks** use the learner's own calendar day, from their browser's time zone. A
  lesson or practice session keeps one alive.
- **Practice** reviews past mistakes, then fills up with exercises from finished
  lessons. It never costs hearts, and finishing earns one heart and 10 XP.
- **The leaderboard** ranks real users by XP since Monday (UTC), showing first name
  and last initial. Sample learners from `src/content/seeded-learners.ts` fill any
  empty places up to `leaderboard.size`. They're calculated, not stored. A short
  note under the board discloses them, set by `leaderboard.seededDisclosure`. Set
  `leaderboard.size` to 0 to show real users only.
- **Guests** can take only the first lesson. Their attempt is stored on the server
  under a random token kept in `localStorage`. When they sign up or sign in, the
  dashboard claims it: a finished lesson awards its XP, streak, and hearts, and an
  unfinished one carries over mid-lesson. Unclaimed guest attempts are deleted after
  30 days.

## Routes

| Path                          | Page                                  |
| ----------------------------- | ------------------------------------- |
| `/`                           | Marketing landing page                |
| `/try`                        | Free guest lesson                     |
| `/sign-in`, `/sign-up`, etc.  | The project's auth pages, restyled    |
| `/dashboard`                  | Learning path                         |
| `/dashboard/lesson/$lessonId` | Lesson player                         |
| `/dashboard/practice`         | Mistakes and practice                 |
| `/dashboard/practice-session` | Practice player                       |
| `/dashboard/leaderboard`      | Weekly leaderboard                    |
| `/dashboard/profile`          | Stats and achievements                |
| `/dashboard/settings`         | Goal, sound, privacy, account         |

## Testing

`pnpm test` covers the rules, the grader, and the course data, including that every
Spanish string has both audio clips.

`e2e/full-journey.ts` plays the real product in a browser, start to finish: a guest
lesson with a wrong answer and a missing accent, signing up, the carry-over, running
out of hearts, practice, all 10 lessons, audio, leaderboard, profile, settings, and
signing back in.

```bash
pnpm exec playwright install chromium
BASE_URL=http://127.0.0.1:<port> pnpm test:e2e
```

It creates a new user on each run, so point it at your local database, not production.

## Before you launch

- Replace `supportEmail`, which is a placeholder address, in the brand config.
- Have a Spanish speaker listen to the audio. No person has reviewed it yet.
- Add your own terms and privacy pages, and link them from the landing page footer.
- There's no billing. Everything is free until you add it.
- The guest endpoints accept anonymous writes. Add a Cloudflare rate-limiting rule
  for `/_serverFn/*` if you expect abuse.
