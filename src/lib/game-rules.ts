import { game } from '~/config/game';
import { seededLearners } from '~/content/seeded-learners';

const minute = 60_000;
const heartIntervalMs = game.hearts.refillMinutes * minute;

export type HeartState = {
  hearts: number;
  /** When the refill timer started, in milliseconds. */
  anchorMs: number;
};

/** Applies any refills that are due. Hearts refill one at a time on a steady timer. */
export function refillHearts(state: HeartState, nowMs: number): HeartState {
  if (state.hearts >= game.hearts.max) {
    return { hearts: game.hearts.max, anchorMs: nowMs };
  }
  const gained = Math.floor(
    Math.max(0, nowMs - state.anchorMs) / heartIntervalMs
  );
  const hearts = Math.min(game.hearts.max, state.hearts + gained);
  return {
    hearts,
    anchorMs:
      hearts >= game.hearts.max
        ? nowMs
        : state.anchorMs + gained * heartIntervalMs
  };
}

/** When the next heart arrives, or null at full hearts. */
export function nextHeartAt(state: HeartState): number | null {
  return state.hearts >= game.hearts.max
    ? null
    : state.anchorMs + heartIntervalMs;
}

/** Removes one heart. Losing the first heart starts the refill timer. */
export function loseHeart(state: HeartState, nowMs: number): HeartState {
  const current = refillHearts(state, nowMs);
  return {
    hearts: Math.max(0, current.hearts - 1),
    anchorMs: current.hearts >= game.hearts.max ? nowMs : current.anchorMs
  };
}

export function gainHearts(
  state: HeartState,
  amount: number,
  nowMs: number
): HeartState {
  const current = refillHearts(state, nowMs);
  const hearts = Math.min(game.hearts.max, current.hearts + amount);
  return {
    hearts,
    anchorMs: hearts >= game.hearts.max ? nowMs : current.anchorMs
  };
}

/** A safe IANA time zone, or UTC if the browser sent something unusable. */
export function safeTimeZone(timeZone: unknown): string {
  if (typeof timeZone !== 'string' || timeZone.length > 64) return 'UTC';
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return timeZone;
  } catch {
    return 'UTC';
  }
}

/** The learner's calendar date as YYYY-MM-DD, in their own time zone. */
export function localDate(nowMs: number, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(nowMs));
}

function dayNumber(date: string): number {
  return Math.round(Date.parse(`${date}T00:00:00Z`) / 86_400_000);
}

export function addDays(date: string, days: number): string {
  return new Date((dayNumber(date) + days) * 86_400_000)
    .toISOString()
    .slice(0, 10);
}

export type StreakState = {
  streak: number;
  longestStreak: number;
  lastActiveDate: string | null;
};

/** Counts today as active. Practice or a lesson once a day keeps a streak alive. */
export function recordActivity(state: StreakState, today: string): StreakState {
  if (state.lastActiveDate === today) return state;
  const continued =
    state.lastActiveDate !== null &&
    dayNumber(today) - dayNumber(state.lastActiveDate) === 1;
  const streak = continued ? state.streak + 1 : 1;
  return {
    streak,
    longestStreak: Math.max(state.longestStreak, streak),
    lastActiveDate: today
  };
}

/** The streak to display. It reads as 0 once a full day has been missed. */
export function currentStreak(state: StreakState, today: string): number {
  if (state.lastActiveDate === null) return 0;
  return dayNumber(today) - dayNumber(state.lastActiveDate) <= 1
    ? state.streak
    : 0;
}

export function lessonXp(options: {
  firstCompletion: boolean;
  perfect: boolean;
}): number {
  if (!options.firstCompletion) return game.xp.lessonReplay;
  return (
    game.xp.lessonFirstTime + (options.perfect ? game.xp.perfectBonus : 0)
  );
}

/** Share of exercises answered right the first time, from 0 to 100. */
export function accuracyPercent(total: number, missed: number): number {
  if (total <= 0) return 100;
  return Math.round(((total - Math.min(missed, total)) / total) * 100);
}

/** The Monday (UTC) that starts the leaderboard week containing `nowMs`. */
export function weekStart(nowMs: number): string {
  const date = new Date(nowMs);
  const daysSinceMonday = (date.getUTCDay() + 6) % 7;
  const monday = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() - daysSinceMonday
    )
  );
  return monday.toISOString().slice(0, 10);
}

export function weekEndsAt(nowMs: number): number {
  return Date.parse(`${weekStart(nowMs)}T00:00:00Z`) + 7 * 86_400_000;
}

/** A small stable hash, so seeded scores differ by learner and by week. */
function hash(text: string): number {
  let value = 2166136261;
  for (const character of text) {
    value ^= character.codePointAt(0)!;
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

export type LeaderboardEntry = {
  id: string;
  name: string;
  xp: number;
  isYou: boolean;
};

/** This week's seeded learners. Their XP climbs through the week, then starts over. */
export function seededEntries(nowMs: number, count: number): LeaderboardEntry[] {
  if (count <= 0) return [];
  const week = weekStart(nowMs);
  const elapsed =
    (nowMs - Date.parse(`${week}T00:00:00Z`)) / (7 * 86_400_000);
  return [...seededLearners]
    .sort((a, b) => hash(`${week}:${a}`) - hash(`${week}:${b}`))
    .slice(0, count)
    .map((name) => {
      const seed = hash(`${name}:${week}`);
      const weeklyTotal = 40 + (seed % 460);
      // Each learner keeps a different pace, so places shift as the week goes on.
      const pace = 0.7 + ((seed >> 9) % 60) / 100;
      const progress = Math.min(1, Math.max(0.04, elapsed ** pace));
      return {
        id: `seeded:${name}`,
        name,
        // Rounded to 5 because every XP reward is a multiple of 5.
        xp: Math.round((weeklyTotal * progress) / 5) * 5,
        isYou: false
      };
    });
}

/**
 * Real learners always appear, including the current learner at 0 XP. Seeded
 * learners only fill the empty places up to `size`.
 */
export function buildLeaderboard(
  real: LeaderboardEntry[],
  nowMs: number,
  size: number = game.leaderboard.size
): { entries: LeaderboardEntry[]; hasSeeded: boolean } {
  const seeded = seededEntries(nowMs, Math.max(0, size - real.length));
  const entries = [...real, ...seeded].sort(
    (a, b) =>
      b.xp - a.xp || Number(b.isYou) - Number(a.isYou) || a.name.localeCompare(b.name)
  );
  return { entries, hasSeeded: seeded.length > 0 };
}
