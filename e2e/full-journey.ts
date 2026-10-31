/**
 * Plays the whole product through a real browser, against a running dev server:
 * guest lesson, sign-up, carry-over, hearts, practice, all 10 lessons, leaderboard,
 * profile, settings, and sign-in again. Every answer goes through the real UI.
 *
 *   pnpm dlx playwright install chromium
 *   BASE_URL=http://127.0.0.1:3000 pnpm test:e2e
 */
import { lessons, getExercise } from '../src/content/course';
import { splitWords } from '../src/content/speech';
import type { Exercise } from '../src/content/types';

const { chromium } = (await import(
  process.env.PLAYWRIGHT_MODULE ?? 'playwright'
)) as typeof import('playwright');
type Page = import('playwright').Page;

const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:3000';
const shots = process.env.SCREENSHOT_DIR;
const stamp = Date.now();
const email = `learner-${stamp}@example.com`;
const password = `Polly-test-${stamp}`;
const name = 'Sam Rivera';

let passed = 0;
function check(condition: unknown, label: string): void {
  if (!condition) throw new Error(`FAILED: ${label}`);
  passed += 1;
  console.log(`  ok  ${label}`);
}
function step(label: string): void {
  console.log(`\n${label}`);
}

function stripAccents(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  headless: true
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true
});
// Records what the audio elements really played, including clips from the cache.
await context.addInitScript(() => {
  const played: { src: string; duration: number }[] = [];
  (window as unknown as { __played: typeof played }).__played = played;
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
    const result = play.call(this);
    void result.then(() => {
      played.push({ src: this.currentSrc, duration: this.duration });
    });
    return result;
  };
});
const page = await context.newPage();

const consoleErrors: string[] = [];
const speechRequests: string[] = [];
const offsiteRequests = new Set<string>();
const failedRequests: string[] = [];
page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('pageerror', (error) => consoleErrors.push(String(error)));
page.on('request', (request) => {
  const url = new URL(request.url());
  if (url.origin !== new URL(baseUrl).origin && url.protocol.startsWith('http')) {
    offsiteRequests.add(url.host);
  }
  if (url.pathname.startsWith('/audio/') && url.pathname.endsWith('.mp3')) {
    speechRequests.push(url.pathname);
  }
});
page.on('response', (response) => {
  const url = new URL(response.url());
  if (url.pathname.startsWith('/audio/') && response.status() >= 400) {
    failedRequests.push(`${response.status()} ${url.pathname}`);
  }
});

async function shot(label: string): Promise<void> {
  if (shots) await page.screenshot({ path: `${shots}/${label}.png` });
}

/** Which lesson screen is showing, once the page has settled. */
async function waitForLessonScreen(): Promise<'exercise' | 'complete' | 'hearts'> {
  const locator = page.locator(
    '[data-exercise-id], [data-completion-screen], [data-out-of-hearts]'
  );
  await locator.first().waitFor({ state: 'visible', timeout: 20_000 });
  if (await page.locator('[data-completion-screen]').count()) return 'complete';
  if (await page.locator('[data-out-of-hearts]').count()) return 'hearts';
  return 'exercise';
}

async function currentExercise(): Promise<Exercise> {
  const id = await page.locator('[data-exercise-id]').getAttribute('data-exercise-id');
  const exercise = id ? getExercise(id) : undefined;
  if (!exercise) throw new Error(`Unknown exercise on screen: ${id}`);
  return exercise;
}

type Mode = 'right' | 'wrong' | 'no-accents';

async function clickWord(word: string): Promise<void> {
  await page.locator(`button[data-word="${word}"]:visible`).first().click();
}

async function answerAndContinue(exercise: Exercise, mode: Mode = 'right'): Promise<string> {
  switch (exercise.type) {
    case 'picture_choice': {
      const value =
        mode === 'wrong'
          ? exercise.options.find((option) => option.es !== exercise.answer)!.es
          : exercise.answer;
      await page.locator(`[data-option="${value}"]`).click();
      break;
    }
    case 'build_sentence': {
      if (mode === 'wrong') {
        await clickWord(exercise.distractors[0]!);
      } else {
        const words = splitWords(exercise.es);
        for (const [index, word] of words.entries()) {
          const tile = index === 0 ? word.toLocaleLowerCase('es') : word;
          const exact = page.locator(`button[data-word="${tile}"]:visible`);
          await ((await exact.count()) ? exact.first() : page.locator(`button[data-word="${word}"]:visible`).first()).click();
        }
      }
      break;
    }
    case 'listen_type': {
      await page
        .locator('[data-typed-answer]')
        .fill(mode === 'wrong' ? 'esto no es' : mode === 'no-accents' ? stripAccents(exercise.es) : exercise.es);
      break;
    }
    case 'match_pairs': {
      if (mode === 'wrong') {
        await page.locator(`[data-match-es="${exercise.pairs[0]!.es}"]`).click();
        await page.locator(`[data-match-en="${exercise.pairs[1]!.en}"]`).click();
        await page.waitForTimeout(500);
      }
      for (const pair of exercise.pairs) {
        await page.locator(`[data-match-es="${pair.es}"]`).click();
        await page.locator(`[data-match-en="${pair.en}"]`).click();
      }
      break;
    }
    case 'fill_blank': {
      if (exercise.options) {
        const value =
          mode === 'wrong'
            ? exercise.options.find((option) => option !== exercise.answer)!
            : exercise.answer;
        await page.locator(`[data-option="${value}"]`).click();
      } else {
        await page
          .locator('[data-typed-answer]')
          .fill(mode === 'wrong' ? 'xxxx' : mode === 'no-accents' ? stripAccents(exercise.answer) : exercise.answer);
      }
      break;
    }
  }
  if (exercise.type !== 'match_pairs') {
    await page.locator('[data-testid="check"]').click();
  }
  const sheet = page.locator('[data-feedback]');
  await sheet.waitFor({ state: 'visible', timeout: 20_000 });
  const verdict = (await sheet.getAttribute('data-feedback')) ?? '';
  const expected = mode === 'wrong' ? 'wrong' : 'correct';
  if (verdict !== expected) {
    throw new Error(`${exercise.id}: expected ${expected} but saw ${verdict}: ${await sheet.innerText()}`);
  }
  const text = await sheet.innerText();
  await page.locator('[data-testid="continue"]').click();
  return text;
}

/** Answers until the lesson ends. `plan` picks a mode per exercise id. */
async function playToEnd(plan: (exercise: Exercise) => Mode = () => 'right') {
  const seen: string[] = [];
  for (let guard = 0; guard < 60; guard++) {
    const screen = await waitForLessonScreen();
    if (screen !== 'exercise') return { screen, seen };
    const exercise = await currentExercise();
    seen.push(exercise.id);
    await answerAndContinue(exercise, plan(exercise));
    await page.waitForFunction(
      (previous) => {
        const node = document.querySelector('[data-exercise-id]');
        return (
          !document.querySelector('[data-feedback]') &&
          (!node || node.getAttribute('data-exercise-id') !== previous || document.querySelector('[data-completion-screen], [data-out-of-hearts]'))
        ) || !document.querySelector('[data-feedback]');
      },
      exercise.id
    );
  }
  throw new Error('Lesson never ended');
}

async function stat(label: 'streak' | 'xp' | 'hearts'): Promise<number> {
  const text = await page.locator(`[data-stat="${label}"]:visible`).first().innerText();
  return Number(text.trim());
}

async function openLesson(lessonId: string): Promise<void> {
  await page.locator(`[data-lesson-node="${lessonId}"] button`).click();
  await page.locator(`[data-start-lesson="${lessonId}"]`).click();
  await page.waitForURL(`**/dashboard/lesson/${lessonId}`);
}

async function goTab(tab: 'Learn' | 'Practice' | 'Leaderboard' | 'Profile'): Promise<void> {
  await page.locator(`[data-tab="${tab}"]`).click();
  await page.waitForTimeout(300);
}

try {
  step('Landing page');
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  check((await page.title()).includes('Polylingo'), 'title names the brand');
  await shot('01-landing');
  await page.locator('[data-testid="try-free"]').first().click();
  await page.waitForURL('**/try');

  step('Guest lesson');
  const first = lessons[0]!;
  let screen = await waitForLessonScreen();
  check(screen === 'exercise', 'a visitor can start without an account');
  check((await currentExercise()).id === first.exercises[0]!.id, 'starts at the first exercise');
  check(await page.getByTestId('voice-disclosure').isVisible(), 'a lesson says its voice is AI-generated');
  await page.locator('[data-testid="hint"]').click();
  check(await page.locator('[data-hint]').isVisible(), 'hint opens');
  await shot('02-picture-choice');

  const firstExercise = await currentExercise();
  await answerAndContinue(firstExercise, 'wrong');
  await waitForLessonScreen();
  check((await page.locator('[data-hearts]').getAttribute('data-hearts')) === '4', 'a mistake costs a heart');

  await page.locator('[data-testid="quit"]').click();
  check(await page.locator('[data-quit-dialog]').isVisible(), 'quit asks for confirmation');
  await shot('03-quit-dialog');
  await page.locator('[data-testid="keep-learning"]').click();

  const beforeReload = (await currentExercise()).id;
  await page.reload({ waitUntil: 'networkidle' });
  await waitForLessonScreen();
  check((await currentExercise()).id === beforeReload, 'reloading resumes from the server');

  let accentNote = '';
  const guestRun = await playToEnd((exercise) => {
    if (!accentNote && exercise.type === 'listen_type' && stripAccents(exercise.es) !== exercise.es) {
      accentNote = exercise.id;
      return 'no-accents';
    }
    return 'right';
  });
  check(guestRun.screen === 'complete', 'guest finishes the lesson');
  check(guestRun.seen.at(-1) === firstExercise.id, 'the wrong answer came back at the end');
  check(Boolean(accentNote), 'a typed answer without accents was accepted');

  // The XP counter animates up to its final value.
  await page.waitForTimeout(1200);
  const completion = await page.locator('[data-completion-screen]').innerText();
  check(/\+?15/.test(completion), 'completion shows XP earned');
  check(completion.includes('90%'), 'completion shows accuracy');
  check(await page.locator('[data-signup-prompt]').isVisible(), 'guest is prompted to sign up');
  await shot('04-guest-complete');

  step('Sign up and carry over');
  await page.locator('[data-testid="guest-sign-up"]').click();
  await page.waitForURL('**/sign-up');
  await shot('05-sign-up');
  await page.locator('#name').fill(name);
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.locator('#confirm-password').fill(password);
  await page.locator('[data-testid="create-account"]').click();
  await page.waitForURL('**/dashboard');
  await page.locator(`[data-lesson-node="${first.id}"][data-state="completed"]`).waitFor({ timeout: 20_000 });
  check(true, 'the guest lesson is complete on the account');
  check((await stat('xp')) === 15, 'its XP carried over');
  check((await stat('hearts')) === 4, 'its hearts carried over');
  check((await stat('streak')) === 1, 'the streak started');
  check(
    (await page.evaluate(() => localStorage.getItem('guest-lesson-token'))) === null,
    'the guest token is used up'
  );

  step('Learning path');
  check((await page.locator('[data-lesson-node]').count()) === 10, 'exactly 10 lessons on the path');
  check(
    (await page.locator('[data-lesson-node="introductions"]').getAttribute('data-state')) === 'current',
    'next lesson is current'
  );
  check((await page.locator('[data-state="locked"]').count()) === 8, 'later lessons are locked');
  await shot('06-path');

  await page.goto(`${baseUrl}/dashboard/lesson/travel`, { waitUntil: 'networkidle' });
  await page.getByText('This lesson is still locked').waitFor();
  check(true, 'the server refuses a locked lesson by URL');
  await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'networkidle' });

  step('Running out of hearts');
  await openLesson('introductions');
  const heartsRun = await playToEnd(() => 'wrong');
  check(heartsRun.screen === 'hearts', 'out-of-hearts screen appears at zero');
  await shot('07-out-of-hearts');
  await page.getByRole('link', { name: /Practice to earn a heart/i }).click();
  await page.waitForURL('**/dashboard/practice-session');
  await page.locator('[data-out-of-hearts]').waitFor({ state: 'detached' });

  step('Practice');
  const practiceRun = await playToEnd();
  check(practiceRun.screen === 'complete', 'practice session finishes');
  check(practiceRun.seen.includes(firstExercise.id), 'practice reviews past mistakes');
  await page.waitForTimeout(1200);
  const practiceDone = await page.locator('[data-completion-screen]').innerText();
  check(/earned 1 heart/i.test(practiceDone), 'practice earns a heart back');
  await page.waitForTimeout(600);
  await shot('08-practice-complete');
  await page.locator('[data-testid="completion-continue"]').click();
  await page.waitForURL('**/dashboard/practice');
  await page.waitForTimeout(800);
  check((await stat('hearts')) === 1, 'hearts went from 0 to 1');
  await shot('09-practice-page');

  step('Finishing the course');
  await goTab('Learn');
  for (const lesson of lessons.slice(1)) {
    await page.locator(`[data-lesson-node="${lesson.id}"][data-state="current"]`).waitFor({ timeout: 20_000 });
    await openLesson(lesson.id);
    const types = new Set<string>();
    const run = await playToEnd((exercise) => {
      types.add(exercise.type);
      return 'right';
    });
    check(run.screen === 'complete', `${lesson.title} complete`);
    await page.waitForTimeout(1000);
    if (lesson.id === 'food') await shot('10-lesson-complete');
    await page.locator('[data-testid="completion-continue"]').click();
    await page.waitForURL('**/dashboard');
  }
  await page.locator('[data-course-progress]').getByText('10/10').waitFor({ timeout: 20_000 });
  check((await page.locator('[data-state="completed"]').count()) === 10, 'all 10 lessons completed');
  check(
    (await page.locator('[data-course-end]').innerText()).includes('finished the path'),
    'the path celebrates the finish'
  );
  await shot('11-path-complete');

  step('Audio');
  await openLesson('greetings');
  await waitForLessonScreen();
  for (let guard = 0; guard < 15; guard++) {
    const exercise = await currentExercise();
    if (exercise.type === 'listen_type') break;
    await answerAndContinue(exercise);
    await waitForLessonScreen();
  }
  const playedClips = () =>
    page.evaluate(
      () => (window as unknown as { __played: { src: string; duration: number }[] }).__played
    );
  const before = (await playedClips()).length;
  await page.locator('[data-play="slow"]').click();
  await page.waitForTimeout(700);
  await page.locator('[data-play="normal"]').click();
  await page.waitForTimeout(700);
  const played = (await playedClips()).slice(before);
  const slowClip = played.find((clip) => clip.src.includes('/slow/'));
  const normalClip = played.find((clip) => clip.src.includes('/normal/'));
  check(slowClip && slowClip.duration > 0, `the slow clip plays (${slowClip?.duration.toFixed(2)}s)`);
  check(normalClip && normalClip.duration > 0, `the normal clip plays (${normalClip?.duration.toFixed(2)}s)`);
  check(slowClip && normalClip && slowClip.duration > normalClip.duration, 'the slow clip is longer');
  check(speechRequests.length > 0, `lessons load clips from static files (${speechRequests.length} requests)`);
  const clipCount = await page.evaluate(() => {
    return fetch('/audio/manifest.json').then((response) => response.json() as Promise<{ clips: object }>).then((manifest) => Object.keys(manifest.clips).length);
  });
  check(clipCount > 100, `the manifest maps ${clipCount} clips to course text`);
  await page.locator('[data-testid="quit"]').click();
  await page.locator('[data-testid="confirm-quit"]').click();
  await page.waitForURL('**/dashboard');

  step('Leaderboard');
  await goTab('Leaderboard');
  await page.locator('[data-leaderboard]').waitFor();
  const rows = await page.locator('[data-leaderboard-row]').count();
  check(rows >= 10, `the board is full (${rows} rows)`);
  const you = await page.locator('[data-leaderboard-row="you"]').innerText();
  check(you.includes('Sam R.'), 'a real user appears with a privacy-safe name');
  await shot('12-leaderboard');

  step('Profile');
  await goTab('Profile');
  const stats = await page.locator('[data-profile-stats]').innerText();
  check(stats.includes('10/10'), 'profile shows all lessons finished');
  const champion = page.locator('[data-achievement="course-champion"]');
  check((await champion.getAttribute('data-unlocked')) === 'true', 'Course Champion is unlocked');
  check(
    (await page.locator('[data-achievement="first-words"]').getAttribute('data-unlocked')) === 'true',
    'First Words is unlocked'
  );
  await shot('13-profile');

  step('Settings');
  await page.goto(`${baseUrl}/dashboard/settings`, { waitUntil: 'networkidle' });
  await page.locator('[data-goal="30"]').click();
  await page.locator('[data-goal="30"][aria-checked="true"]').waitFor();
  check(true, 'daily goal saves');
  await page.locator('#settings-name').fill('Samantha Rivera');
  await page.locator('[data-testid="save-name"]').click();
  await page.getByText('Name saved.').waitFor();
  check(true, 'name saves');
  await shot('14-settings');
  await page.reload({ waitUntil: 'networkidle' });
  check(
    (await page.locator('[data-goal="30"]').getAttribute('aria-checked')) === 'true',
    'settings persist after reload'
  );

  step('Sign out and back in');
  await page.locator('[data-testid="sign-out"]').click();
  await page.waitForURL(`${baseUrl}/`);
  await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'networkidle' });
  check(page.url().includes('/sign-in'), 'signed-out visitors are redirected to sign in');
  await shot('15-sign-in');
  await page.locator('[data-testid="password-toggle"]').click();
  await page.locator('#password-email').fill(email);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: /sign in with password/i }).last().click();
  await page.waitForURL('**/dashboard');
  await page.locator('[data-course-progress]').getByText('10/10').waitFor({ timeout: 20_000 });
  check(true, 'all progress is still there after signing back in');

  step('Desktop layout');
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.reload({ waitUntil: 'networkidle' });
  check(await page.locator('[data-nav="Learn"]').isVisible(), 'sidebar shows on desktop');
  check(!(await page.locator('[data-tab="Learn"]').isVisible()), 'tab bar hides on desktop');
  await shot('16-desktop');

  step('Health');
  check(failedRequests.length === 0, `no audio request failed ${failedRequests.join(', ')}`);
  check(offsiteRequests.size === 0, `no requests left the app ${[...offsiteRequests].join(', ')}`);
  const realErrors = consoleErrors.filter(
    // Browsers log expected 401s from the auth probe, and refused autoplay isn't a bug.
    (text) => !/status of 40[01]/.test(text) && !/NotAllowedError/.test(text)
  );
  check(realErrors.length === 0, `no console errors ${realErrors.slice(0, 3).join(' | ')}`);

  console.log(`\nPASSED ${passed} checks. Test account: ${email}`);
} catch (error) {
  await page.screenshot({ path: `${shots ?? '.'}/failure.png` }).catch(() => {});
  console.error(error);
  console.error(`\nStopped after ${passed} passing checks. Page: ${page.url()}`);
  process.exitCode = 1;
} finally {
  await browser.close();
}

