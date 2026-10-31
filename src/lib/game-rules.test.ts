import { describe, expect, it } from 'vitest';
import { game } from '~/config/game';
import {
  accuracyPercent,
  buildLeaderboard,
  currentStreak,
  gainHearts,
  lessonXp,
  localDate,
  loseHeart,
  nextHeartAt,
  recordActivity,
  refillHearts,
  safeTimeZone,
  seededEntries,
  weekStart
} from './game-rules';

const interval = game.hearts.refillMinutes * 60_000;

describe('hearts', () => {
  it('loses a heart and starts the timer from full', () => {
    const state = loseHeart({ hearts: 5, anchorMs: 0 }, 1000);
    expect(state).toEqual({ hearts: 4, anchorMs: 1000 });
    expect(nextHeartAt(state)).toBe(1000 + interval);
  });

  it('never goes below zero', () => {
    expect(loseHeart({ hearts: 0, anchorMs: 1000 }, 1000).hearts).toBe(0);
  });

  it('refills one heart per interval and keeps the remainder', () => {
    const state = refillHearts({ hearts: 1, anchorMs: 0 }, interval * 2 + 500);
    expect(state).toEqual({ hearts: 3, anchorMs: interval * 2 });
  });

  it('caps at the maximum and clears the timer', () => {
    const state = refillHearts({ hearts: 4, anchorMs: 0 }, interval * 10);
    expect(state.hearts).toBe(5);
    expect(nextHeartAt(state)).toBeNull();
  });

  it('keeps the running timer when a heart is earned', () => {
    expect(gainHearts({ hearts: 1, anchorMs: 100 }, 1, 200)).toEqual({
      hearts: 2,
      anchorMs: 100
    });
  });
});

describe('streaks', () => {
  const start = { streak: 0, longestStreak: 0, lastActiveDate: null };

  it('starts at one on the first day', () => {
    expect(recordActivity(start, '2026-03-01').streak).toBe(1);
  });

  it('does not grow twice in one day', () => {
    const day = recordActivity(start, '2026-03-01');
    expect(recordActivity(day, '2026-03-01').streak).toBe(1);
  });

  it('grows on the next day, including across a month', () => {
    const day = recordActivity(start, '2026-02-28');
    expect(recordActivity(day, '2026-03-01').streak).toBe(2);
  });

  it('restarts after a missed day and keeps the longest', () => {
    let state = recordActivity(start, '2026-03-01');
    state = recordActivity(state, '2026-03-02');
    state = recordActivity(state, '2026-03-05');
    expect(state).toMatchObject({ streak: 1, longestStreak: 2 });
  });

  it('displays zero once a day was missed, before any new activity', () => {
    const state = recordActivity(start, '2026-03-01');
    expect(currentStreak(state, '2026-03-02')).toBe(1);
    expect(currentStreak(state, '2026-03-03')).toBe(0);
  });

  it('uses the learner’s own calendar day', () => {
    const lateFridayLa = Date.parse('2026-03-07T05:00:00Z');
    expect(localDate(lateFridayLa, 'America/Los_Angeles')).toBe('2026-03-06');
    expect(localDate(lateFridayLa, 'UTC')).toBe('2026-03-07');
  });

  it('falls back to UTC for an unusable time zone', () => {
    expect(safeTimeZone('Not/AZone')).toBe('UTC');
    expect(safeTimeZone(42)).toBe('UTC');
    expect(safeTimeZone('America/Chicago')).toBe('America/Chicago');
  });
});

describe('xp and accuracy', () => {
  it('awards first time, perfect, and replay XP', () => {
    expect(lessonXp({ firstCompletion: true, perfect: false })).toBe(15);
    expect(lessonXp({ firstCompletion: true, perfect: true })).toBe(20);
    expect(lessonXp({ firstCompletion: false, perfect: true })).toBe(5);
  });

  it('computes accuracy from first-try results', () => {
    expect(accuracyPercent(10, 0)).toBe(100);
    expect(accuracyPercent(10, 3)).toBe(70);
    expect(accuracyPercent(9, 20)).toBe(0);
  });
});

describe('the leaderboard', () => {
  const now = Date.parse('2026-10-29T12:00:00Z');
  const you = { id: 'you', name: 'You', xp: 0, isYou: true };

  it('starts weeks on Monday UTC', () => {
    expect(weekStart(Date.parse('2026-11-01T23:00:00Z'))).toBe('2026-10-26');
    expect(weekStart(Date.parse('2026-11-02T00:00:00Z'))).toBe('2026-11-02');
  });

  it('tops up with seeded learners to the target size', () => {
    const { entries, hasSeeded } = buildLeaderboard([you], now, 20);
    expect(entries).toHaveLength(20);
    expect(hasSeeded).toBe(true);
    expect(entries.some((entry) => entry.isYou)).toBe(true);
  });

  it('needs no seeded learners once real users fill the board', () => {
    const real = Array.from({ length: 20 }, (_, index) => ({
      id: `u${index}`,
      name: `User ${index}`,
      xp: index,
      isYou: false
    }));
    const { entries, hasSeeded } = buildLeaderboard(real, now, 20);
    expect(hasSeeded).toBe(false);
    expect(entries.every((entry) => entry.id.startsWith('u'))).toBe(true);
  });

  it('can be turned off', () => {
    expect(buildLeaderboard([you], now, 0)).toEqual({
      entries: [you],
      hasSeeded: false
    });
  });

  it('is stable within a moment and climbs during the week', () => {
    const early = seededEntries(Date.parse('2026-10-26T06:00:00Z'), 5);
    const again = seededEntries(Date.parse('2026-10-26T06:00:00Z'), 5);
    const late = seededEntries(Date.parse('2026-11-01T20:00:00Z'), 5);
    expect(early).toEqual(again);
    for (const [index, entry] of early.entries()) {
      expect(late[index]!.xp).toBeGreaterThanOrEqual(entry.xp);
    }
  });

  it('sorts by XP', () => {
    const { entries } = buildLeaderboard([{ ...you, xp: 5000 }], now, 10);
    expect(entries[0]!.isYou).toBe(true);
    const scores = entries.map((entry) => entry.xp);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });
});
