import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  inArray,
  isNull,
  lt,
  or,
  sql
} from 'drizzle-orm';
import { game } from '~/config/game';
import { achievements as achievementList } from '~/content/achievements';
import {
  getExercise,
  getLesson,
  getLessonIndex,
  lessons,
  freeLessonId
} from '~/content/course';
import { db } from '~/db';
import {
  dailyActivity,
  learnerProfile,
  lessonAttempt,
  lessonProgress,
  mistake,
  user,
  userAchievement,
  weeklyXp
} from '~/db/schema';
import { gradeAnswer, type Answer } from '~/lib/grading';
import {
  accuracyPercent,
  addDays,
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
  weekEndsAt,
  weekStart,
  type LeaderboardEntry
} from '~/lib/game-rules';
import type {
  AttemptView,
  CheckResult,
  ClaimResult,
  CompletionSummary,
  LeaderboardView,
  LearnerState,
  PracticeView,
  ProfileView,
  StartResult
} from '~/lib/game-types';

export type Actor = { type: 'user'; id: string } | { type: 'guest'; token: string };

type Attempt = typeof lessonAttempt.$inferSelect;
type Profile = typeof learnerProfile.$inferSelect;

const practiceLessonId = 'practice';
const guestRetentionMs = 30 * 86_400_000;

function ownerFilter(actor: Actor) {
  return actor.type === 'user'
    ? eq(lessonAttempt.userId, actor.id)
    : and(
        eq(lessonAttempt.guestToken, actor.token),
        isNull(lessonAttempt.userId)
      );
}

// Profiles

async function getProfile(userId: string, nowMs: number): Promise<Profile> {
  await db
    .insert(learnerProfile)
    .values({ userId, heartsAnchorMs: nowMs, dailyGoal: game.defaultDailyGoal })
    .onConflictDoNothing();
  const [profile] = await db
    .select()
    .from(learnerProfile)
    .where(eq(learnerProfile.userId, userId))
    .limit(1);
  if (!profile) throw new Error('Could not load learner profile');
  return profile;
}

function heartsOf(profile: Profile, nowMs: number) {
  return refillHearts(
    { hearts: profile.hearts, anchorMs: profile.heartsAnchorMs },
    nowMs
  );
}

async function completedLessonIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ lessonId: lessonProgress.lessonId })
    .from(lessonProgress)
    .where(eq(lessonProgress.userId, userId));
  return rows.map((row) => row.lessonId);
}

function firstUnfinishedLesson(completed: Set<string>): string | null {
  return lessons.find((lesson) => !completed.has(lesson.id))?.id ?? null;
}

async function dailyXpOn(userId: string, date: string): Promise<number> {
  const [row] = await db
    .select({ xp: dailyActivity.xp })
    .from(dailyActivity)
    .where(and(eq(dailyActivity.userId, userId), eq(dailyActivity.date, date)))
    .limit(1);
  return row?.xp ?? 0;
}

export async function getLearnerState(userId: string): Promise<LearnerState> {
  const nowMs = Date.now();
  const profile = await getProfile(userId, nowMs);
  const today = localDate(nowMs, profile.timeZone);
  const hearts = heartsOf(profile, nowMs);
  const [completed, dailyXp, mistakes, active] = await Promise.all([
    completedLessonIds(userId),
    dailyXpOn(userId, today),
    db
      .select({ value: count() })
      .from(mistake)
      .where(and(eq(mistake.userId, userId), isNull(mistake.resolvedAt))),
    db
      .select({
        lessonId: lessonAttempt.lessonId,
        position: lessonAttempt.position,
        queue: lessonAttempt.queue,
        totalExercises: lessonAttempt.totalExercises
      })
      .from(lessonAttempt)
      .where(
        and(
          eq(lessonAttempt.userId, userId),
          eq(lessonAttempt.status, 'active'),
          eq(lessonAttempt.kind, 'lesson')
        )
      )
  ]);
  const completedSet = new Set(completed);
  return {
    hearts: hearts.hearts,
    maxHearts: game.hearts.max,
    nextHeartAt: nextHeartAt(hearts),
    xp: profile.xp,
    streak: currentStreak(profile, today),
    longestStreak: profile.longestStreak,
    streakActiveToday: profile.lastActiveDate === today,
    dailyXp,
    dailyGoal: profile.dailyGoal,
    soundEnabled: profile.soundEnabled,
    showOnLeaderboard: profile.showOnLeaderboard,
    completedLessonIds: completed,
    currentLessonId: firstUnfinishedLesson(completedSet),
    lessonProgress: Object.fromEntries(
      active.map((attempt) => [
        attempt.lessonId,
        // Started counts as started, even if nothing has been answered right yet.
        Math.max(0.02, solvedCount(attempt) / attempt.totalExercises)
      ])
    ),
    mistakesCount: mistakes[0]?.value ?? 0,
    courseComplete: lessons.every((lesson) => completedSet.has(lesson.id))
  };
}

// Attempts

/** A wrong answer adds a repeat to the queue, so this counts only finished exercises. */
function solvedCount(attempt: {
  position: number;
  queue: string[];
  totalExercises: number;
}): number {
  const repeats = attempt.queue.length - attempt.totalExercises;
  return Math.max(0, attempt.position - repeats);
}

function attemptView(
  attempt: Attempt,
  hearts: { hearts: number; next: number | null } | null
): AttemptView {
  return {
    id: attempt.id,
    kind: attempt.kind,
    lessonId: attempt.lessonId,
    queue: attempt.queue,
    position: attempt.position,
    totalExercises: attempt.totalExercises,
    hearts: hearts?.hearts ?? null,
    nextHeartAt: hearts?.next ?? null,
    summary: attempt.summary ?? null
  };
}

function isCurrentContent(attempt: Attempt): boolean {
  return attempt.queue.every((id) => getExercise(id));
}

async function findActiveAttempt(
  actor: Actor,
  lessonId: string
): Promise<Attempt | undefined> {
  const [attempt] = await db
    .select()
    .from(lessonAttempt)
    .where(
      and(
        ownerFilter(actor),
        eq(lessonAttempt.lessonId, lessonId),
        eq(lessonAttempt.status, 'active')
      )
    )
    .limit(1);
  // An exercise removed from the course can't be resumed, so start that attempt over.
  if (attempt && !isCurrentContent(attempt)) {
    await db.delete(lessonAttempt).where(eq(lessonAttempt.id, attempt.id));
    return undefined;
  }
  return attempt;
}

async function createAttempt(
  actor: Actor,
  values: {
    kind: Attempt['kind'];
    lessonId: string;
    queue: string[];
  }
): Promise<Attempt> {
  const now = new Date();
  await db
    .insert(lessonAttempt)
    .values({
      ...values,
      totalExercises: values.queue.length,
      userId: actor.type === 'user' ? actor.id : null,
      guestToken: actor.type === 'guest' ? actor.token : null,
      guestHearts: actor.type === 'guest' ? game.hearts.max : null,
      createdAt: now,
      updatedAt: now
    })
    // Two tabs starting at once: the second falls through to the select below.
    .onConflictDoNothing();
  const attempt = await findActiveAttempt(actor, values.lessonId);
  if (!attempt) throw new Error('Could not start this lesson');
  return attempt;
}

export async function startLesson(
  userId: string,
  lessonId: string
): Promise<StartResult> {
  const lesson = getLesson(lessonId);
  if (!lesson) return { status: 'not_found' };

  const nowMs = Date.now();
  const profile = await getProfile(userId, nowMs);
  const hearts = heartsOf(profile, nowMs);
  if (hearts.hearts <= 0) {
    return { status: 'out_of_hearts', nextHeartAt: nextHeartAt(hearts) };
  }

  const completed = new Set(await completedLessonIds(userId));
  const previous = lessons[getLessonIndex(lessonId) - 1];
  if (previous && !completed.has(previous.id)) return { status: 'locked' };

  const actor: Actor = { type: 'user', id: userId };
  const attempt =
    (await findActiveAttempt(actor, lessonId)) ??
    (await createAttempt(actor, {
      kind: 'lesson',
      lessonId,
      queue: lesson.exercises.map((exercise) => exercise.id)
    }));
  return {
    status: 'ok',
    attempt: attemptView(attempt, {
      hearts: hearts.hearts,
      next: nextHeartAt(hearts)
    })
  };
}

export async function startPractice(userId: string): Promise<StartResult> {
  const nowMs = Date.now();
  const actor: Actor = { type: 'user', id: userId };
  const profile = await getProfile(userId, nowMs);
  const hearts = heartsOf(profile, nowMs);
  const heartsInfo = { hearts: hearts.hearts, next: nextHeartAt(hearts) };

  const active = await findActiveAttempt(actor, practiceLessonId);
  if (active) {
    return {
      status: 'ok',
      attempt: { ...attemptView(active, heartsInfo), hearts: null }
    };
  }

  const queue = await buildPracticeQueue(userId);
  if (queue.length === 0) return { status: 'empty' };
  const attempt = await createAttempt(actor, {
    kind: 'practice',
    lessonId: practiceLessonId,
    queue
  });
  return {
    status: 'ok',
    attempt: { ...attemptView(attempt, heartsInfo), hearts: null }
  };
}

/** Past mistakes come first, oldest first. Finished lessons fill any space left. */
async function buildPracticeQueue(userId: string): Promise<string[]> {
  const rows = await db
    .select({ exerciseId: mistake.exerciseId })
    .from(mistake)
    .where(and(eq(mistake.userId, userId), isNull(mistake.resolvedAt)))
    .orderBy(asc(mistake.lastWrongAt));
  const queue = rows
    .map((row) => row.exerciseId)
    .filter((id) => getExercise(id))
    .slice(0, game.practice.size);

  if (queue.length < game.practice.size) {
    const completed = await completedLessonIds(userId);
    const reviewPool = lessons
      .filter((lesson) => completed.includes(lesson.id))
      .flatMap((lesson) => lesson.exercises.map((exercise) => exercise.id))
      .filter((id) => !queue.includes(id));
    for (let index = reviewPool.length - 1; index > 0; index--) {
      const swap = Math.floor(Math.random() * (index + 1));
      [reviewPool[index], reviewPool[swap]] = [reviewPool[swap]!, reviewPool[index]!];
    }
    queue.push(...reviewPool.slice(0, game.practice.size - queue.length));
  }
  return queue;
}

export async function startGuestLesson(
  token: string,
  restart: boolean
): Promise<StartResult> {
  const actor: Actor = { type: 'guest', token };
  const nowMs = Date.now();
  // Abandoned guest sessions are removed as new ones arrive.
  await db
    .delete(lessonAttempt)
    .where(
      and(
        isNull(lessonAttempt.userId),
        lt(lessonAttempt.updatedAt, new Date(nowMs - guestRetentionMs))
      )
    );

  const lesson = getLesson(freeLessonId)!;
  if (restart) {
    await db
      .delete(lessonAttempt)
      .where(
        and(
          ownerFilter(actor),
          eq(lessonAttempt.lessonId, lesson.id),
          eq(lessonAttempt.status, 'active')
        )
      );
  } else {
    const [completed] = await db
      .select()
      .from(lessonAttempt)
      .where(
        and(ownerFilter(actor), eq(lessonAttempt.status, 'completed'))
      )
      .orderBy(desc(lessonAttempt.completedAt))
      .limit(1);
    const activeAttempt = await findActiveAttempt(actor, lesson.id);
    if (completed && !activeAttempt) {
      return { status: 'ok', attempt: guestAttemptView(completed) };
    }
    if (activeAttempt) {
      return { status: 'ok', attempt: guestAttemptView(activeAttempt) };
    }
  }

  const attempt = await createAttempt(actor, {
    kind: 'lesson',
    lessonId: lesson.id,
    queue: lesson.exercises.map((exercise) => exercise.id)
  });
  return { status: 'ok', attempt: guestAttemptView(attempt) };
}

function guestAttemptView(attempt: Attempt): AttemptView {
  return attemptView(attempt, {
    hearts: attempt.guestHearts ?? game.hearts.max,
    next: null
  });
}

// Answers

export async function submitAnswer(
  actor: Actor,
  input: {
    attemptId: string;
    position: number;
    exerciseId: string;
    answer: Answer;
  }
): Promise<CheckResult> {
  const nowMs = Date.now();
  const [attempt] = await db
    .select()
    .from(lessonAttempt)
    .where(and(eq(lessonAttempt.id, input.attemptId), ownerFilter(actor)))
    .limit(1);
  if (!attempt) throw new Error('This lesson could not be found');

  const exercise = getExercise(input.exerciseId);
  if (!exercise) throw new Error('This exercise could not be found');

  const hearts = await attemptHearts(actor, attempt, nowMs);
  const respond = (
    status: CheckResult['status'],
    grade: { correct: boolean; canonical: string; accentFix: boolean },
    current: Attempt,
    heartsNow: { hearts: number; next: number | null } | null
  ): CheckResult => ({
    status,
    ...grade,
    attempt: attemptView(current, heartsNow)
  });
  const noGrade = { correct: false, canonical: '', accentFix: false };

  if (
    attempt.status !== 'active' ||
    attempt.position !== input.position ||
    attempt.queue[attempt.position] !== input.exerciseId
  ) {
    return respond('out_of_sync', noGrade, attempt, hearts);
  }
  if (attempt.kind === 'lesson' && hearts && hearts.hearts <= 0) {
    return respond('out_of_hearts', noGrade, attempt, hearts);
  }

  const grade = gradeAnswer(exercise, input.answer);
  const queue = grade.correct ? attempt.queue : [...attempt.queue, exercise.id];
  const position = attempt.position + 1;
  const missedIds =
    grade.correct || attempt.missedIds.includes(exercise.id)
      ? attempt.missedIds
      : [...attempt.missedIds, exercise.id];
  const finished = position >= queue.length;

  // Only the update that moves this exact position wins, so a double submit
  // can't take two hearts or award XP twice.
  const [moved] = await db
    .update(lessonAttempt)
    .set({
      queue,
      position,
      missedIds,
      updatedAt: new Date(nowMs),
      status: finished ? 'completed' : 'active',
      completedAt: finished ? new Date(nowMs) : null
    })
    .where(
      and(
        eq(lessonAttempt.id, attempt.id),
        eq(lessonAttempt.position, attempt.position),
        eq(lessonAttempt.status, 'active')
      )
    )
    .returning();
  if (!moved) {
    const [latest] = await db
      .select()
      .from(lessonAttempt)
      .where(eq(lessonAttempt.id, attempt.id))
      .limit(1);
    return respond('out_of_sync', noGrade, latest ?? attempt, hearts);
  }

  let current = moved;
  let heartsAfter = hearts;

  if (actor.type === 'user') {
    if (!grade.correct) {
      await recordMistake(actor.id, exercise.id, nowMs);
      if (attempt.kind === 'lesson') {
        const profile = await getProfile(actor.id, nowMs);
        const next = loseHeart(
          { hearts: profile.hearts, anchorMs: profile.heartsAnchorMs },
          nowMs
        );
        await db
          .update(learnerProfile)
          .set({ hearts: next.hearts, heartsAnchorMs: next.anchorMs })
          .where(eq(learnerProfile.userId, actor.id));
        heartsAfter = { hearts: next.hearts, next: nextHeartAt(next) };
      }
    } else if (attempt.kind === 'practice') {
      await resolveMistake(actor.id, exercise.id, nowMs);
    }
  } else if (!grade.correct) {
    const guestHearts = Math.max(0, (attempt.guestHearts ?? game.hearts.max) - 1);
    const [updated] = await db
      .update(lessonAttempt)
      .set({ guestHearts })
      .where(eq(lessonAttempt.id, attempt.id))
      .returning();
    current = updated ?? current;
    heartsAfter = { hearts: guestHearts, next: null };
  }

  if (finished) {
    const summary =
      actor.type === 'user'
        ? await grantCompletion(actor.id, current, nowMs)
        : guestSummary(current);
    const [saved] = await db
      .update(lessonAttempt)
      .set({
        summary,
        xpEarned: summary.xpEarned,
        accuracy: summary.accuracy
      })
      .where(eq(lessonAttempt.id, current.id))
      .returning();
    current = saved ?? current;
    if (actor.type === 'user' && attempt.kind === 'practice') {
      heartsAfter = { hearts: summary.hearts, next: null };
    }
  }

  return respond(
    'ok',
    grade,
    current,
    attempt.kind === 'practice' && !finished ? null : heartsAfter
  );
}

async function attemptHearts(actor: Actor, attempt: Attempt, nowMs: number) {
  if (actor.type === 'guest') {
    return { hearts: attempt.guestHearts ?? game.hearts.max, next: null };
  }
  if (attempt.kind === 'practice') return null;
  const hearts = heartsOf(await getProfile(actor.id, nowMs), nowMs);
  return { hearts: hearts.hearts, next: nextHeartAt(hearts) };
}

async function recordMistake(
  userId: string,
  exerciseId: string,
  nowMs: number
) {
  const now = new Date(nowMs);
  await db
    .insert(mistake)
    .values({ userId, exerciseId, lastWrongAt: now })
    .onConflictDoUpdate({
      target: [mistake.userId, mistake.exerciseId],
      set: {
        timesWrong: sql`${mistake.timesWrong} + 1`,
        lastWrongAt: now,
        resolvedAt: null
      }
    });
}

async function resolveMistake(
  userId: string,
  exerciseId: string,
  nowMs: number
) {
  const fixed = await db
    .update(mistake)
    .set({ resolvedAt: new Date(nowMs) })
    .where(
      and(
        eq(mistake.userId, userId),
        eq(mistake.exerciseId, exerciseId),
        isNull(mistake.resolvedAt)
      )
    )
    .returning({ exerciseId: mistake.exerciseId });
  if (fixed.length > 0) {
    await db
      .update(learnerProfile)
      .set({ mistakesFixed: sql`${learnerProfile.mistakesFixed} + 1` })
      .where(eq(learnerProfile.userId, userId));
  }
}

// Completion

function nextLessonAfter(lessonId: string): string | null {
  return lessons[getLessonIndex(lessonId) + 1]?.id ?? null;
}

function guestSummary(attempt: Attempt): CompletionSummary {
  const missed = attempt.missedIds.length;
  const perfect = missed === 0;
  const xpEarned = lessonXp({ firstCompletion: true, perfect });
  return {
    kind: 'lesson',
    lessonId: attempt.lessonId,
    xpEarned,
    accuracy: accuracyPercent(attempt.totalExercises, missed),
    perfect,
    total: attempt.totalExercises,
    missed,
    streak: 1,
    streakExtended: true,
    dailyXp: xpEarned,
    dailyGoal: game.defaultDailyGoal,
    goalJustMet: xpEarned >= game.defaultDailyGoal,
    heartsEarned: 0,
    hearts: attempt.guestHearts ?? game.hearts.max,
    newAchievements: [],
    courseComplete: false,
    nextLessonId: nextLessonAfter(attempt.lessonId)
  };
}

/** The one place XP, streaks, daily goals, and achievements are awarded. */
async function grantCompletion(
  userId: string,
  attempt: Pick<
    Attempt,
    'kind' | 'lessonId' | 'totalExercises' | 'missedIds'
  >,
  nowMs: number
): Promise<CompletionSummary> {
  const profile = await getProfile(userId, nowMs);
  const today = localDate(nowMs, profile.timeZone);
  const isLesson = attempt.kind === 'lesson';
  const missed = attempt.missedIds.length;
  const perfect = missed === 0;
  const accuracy = accuracyPercent(attempt.totalExercises, missed);

  const completed = new Set(await completedLessonIds(userId));
  const firstCompletion = isLesson && !completed.has(attempt.lessonId);
  const xpEarned = isLesson
    ? lessonXp({ firstCompletion, perfect })
    : game.xp.practice;
  if (isLesson) completed.add(attempt.lessonId);

  const streakBefore = currentStreak(profile, today);
  const streak = recordActivity(profile, today);

  const dailyBefore = await dailyXpOn(userId, today);
  const dailyXp = dailyBefore + xpEarned;
  const goalJustMet =
    dailyBefore < profile.dailyGoal && dailyXp >= profile.dailyGoal;

  const hearts = isLesson
    ? refillHearts(
        { hearts: profile.hearts, anchorMs: profile.heartsAnchorMs },
        nowMs
      )
    : gainHearts(
        { hearts: profile.hearts, anchorMs: profile.heartsAnchorMs },
        game.hearts.practiceReward,
        nowMs
      );
  const heartsBefore = heartsOf(profile, nowMs).hearts;

  const stats = {
    xp: profile.xp + xpEarned,
    longestStreak: streak.longestStreak,
    lessonsCompleted: completed.size,
    perfectLessons: profile.perfectLessons + (isLesson && perfect ? 1 : 0),
    practiceSessions: profile.practiceSessions + (isLesson ? 0 : 1),
    // Fixes during this session were already saved on the profile.
    mistakesFixed: profile.mistakesFixed,
    dailyGoalsHit: profile.dailyGoalsHit + (goalJustMet ? 1 : 0)
  };

  const owned = new Set(
    (
      await db
        .select({ id: userAchievement.achievementId })
        .from(userAchievement)
        .where(eq(userAchievement.userId, userId))
    ).map((row) => row.id)
  );
  const newAchievements = achievementList
    .filter(
      (achievement) => achievement.unlocked(stats) && !owned.has(achievement.id)
    )
    .map((achievement) => achievement.id);

  const week = weekStart(nowMs);
  const now = new Date(nowMs);
  await db.batch([
    db
      .update(learnerProfile)
      .set({
        xp: stats.xp,
        hearts: hearts.hearts,
        heartsAnchorMs: hearts.anchorMs,
        streak: streak.streak,
        longestStreak: streak.longestStreak,
        lastActiveDate: streak.lastActiveDate,
        perfectLessons: stats.perfectLessons,
        practiceSessions: stats.practiceSessions,
        dailyGoalsHit: stats.dailyGoalsHit
      })
      .where(eq(learnerProfile.userId, userId)),
    db
      .insert(dailyActivity)
      .values({ userId, date: today, xp: xpEarned })
      .onConflictDoUpdate({
        target: [dailyActivity.userId, dailyActivity.date],
        set: { xp: sql`${dailyActivity.xp} + ${xpEarned}` }
      }),
    db
      .insert(weeklyXp)
      .values({ userId, weekStart: week, xp: xpEarned })
      .onConflictDoUpdate({
        target: [weeklyXp.weekStart, weeklyXp.userId],
        set: { xp: sql`${weeklyXp.xp} + ${xpEarned}` }
      }),
    ...(isLesson
      ? [
          db
            .insert(lessonProgress)
            .values({
              userId,
              lessonId: attempt.lessonId,
              bestAccuracy: accuracy,
              firstCompletedAt: now
            })
            .onConflictDoUpdate({
              target: [lessonProgress.userId, lessonProgress.lessonId],
              set: {
                timesCompleted: sql`${lessonProgress.timesCompleted} + 1`,
                bestAccuracy: sql`max(${lessonProgress.bestAccuracy}, ${accuracy})`
              }
            })
        ]
      : []),
    ...newAchievements.map((achievementId) =>
      db
        .insert(userAchievement)
        .values({ userId, achievementId, unlockedAt: now })
        .onConflictDoNothing()
    )
  ]);

  return {
    kind: attempt.kind,
    lessonId: attempt.lessonId,
    xpEarned,
    accuracy,
    perfect,
    total: attempt.totalExercises,
    missed,
    streak: streak.streak,
    streakExtended: streak.streak > streakBefore,
    dailyXp,
    dailyGoal: profile.dailyGoal,
    goalJustMet,
    heartsEarned: Math.max(0, hearts.hearts - heartsBefore),
    hearts: hearts.hearts,
    newAchievements,
    courseComplete: lessons.every((lesson) => completed.has(lesson.id)),
    nextLessonId: isLesson ? nextLessonAfter(attempt.lessonId) : null
  };
}

// Guest progress carries over when a visitor signs up or signs in.

export async function claimGuestProgress(
  userId: string,
  token: string
): Promise<ClaimResult> {
  const nowMs = Date.now();
  const attempts = await db
    .select()
    .from(lessonAttempt)
    .where(ownerFilter({ type: 'guest', token }))
    .orderBy(desc(lessonAttempt.updatedAt));
  if (attempts.length === 0) return { claimed: null, xp: 0 };

  const completedAttempt = attempts.find((row) => row.status === 'completed');
  const activeAttempt = attempts.find((row) => row.status === 'active');
  const best = completedAttempt ?? activeAttempt!;

  const profile = await getProfile(userId, nowMs);
  const done = await completedLessonIds(userId);
  const alreadyDone = done.includes(best.lessonId);
  const isNewLearner = done.length === 0 && profile.xp === 0;

  // A new learner keeps the hearts they had as a guest, but never starts locked out.
  if (isNewLearner) {
    const guestHearts = best.guestHearts ?? game.hearts.max;
    await db
      .update(learnerProfile)
      .set({
        hearts: Math.max(1, guestHearts),
        heartsAnchorMs: nowMs
      })
      .where(eq(learnerProfile.userId, userId));
  }

  for (const exerciseId of best.missedIds) {
    if (getExercise(exerciseId)) await recordMistake(userId, exerciseId, nowMs);
  }

  let result: ClaimResult = { claimed: null, xp: 0 };
  if (best.status === 'completed' && !alreadyDone) {
    const summary = await grantCompletion(userId, best, nowMs);
    await db
      .update(lessonAttempt)
      .set({ userId, guestToken: null, summary })
      .where(eq(lessonAttempt.id, best.id));
    result = { claimed: 'completed', xp: summary.xpEarned };
  } else if (best.status === 'active' && !alreadyDone) {
    const existing = await findActiveAttempt(
      { type: 'user', id: userId },
      best.lessonId
    );
    if (!existing) {
      await db
        .update(lessonAttempt)
        .set({ userId, guestToken: null, guestHearts: null })
        .where(eq(lessonAttempt.id, best.id));
      result = { claimed: 'in_progress', xp: 0 };
    }
  }

  // Whatever wasn't carried over has served its purpose.
  await db
    .delete(lessonAttempt)
    .where(ownerFilter({ type: 'guest', token }));
  return result;
}

// Leaderboard

function publicName(name: string | null): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Learner';
  const [first, ...rest] = parts;
  const last = rest.at(-1);
  return last ? `${first} ${last[0]!.toUpperCase()}.` : first!;
}

export async function getLeaderboard(
  userId: string
): Promise<LeaderboardView> {
  const nowMs = Date.now();
  const week = weekStart(nowMs);
  const size = game.leaderboard.size;

  const top = await db
    .select({ id: weeklyXp.userId, name: user.name, xp: weeklyXp.xp })
    .from(weeklyXp)
    .innerJoin(user, eq(user.id, weeklyXp.userId))
    .innerJoin(learnerProfile, eq(learnerProfile.userId, weeklyXp.userId))
    .where(
      and(
        eq(weeklyXp.weekStart, week),
        eq(learnerProfile.showOnLeaderboard, true),
        or(isNull(user.banned), eq(user.banned, false))
      )
    )
    .orderBy(desc(weeklyXp.xp))
    .limit(Math.max(size, 50));

  const real: LeaderboardEntry[] = top.map((row) => ({
    id: row.id,
    name: publicName(row.name),
    xp: row.xp,
    isYou: row.id === userId
  }));

  // The learner always sees themself, even at 0 XP or hidden from others.
  let yourXp = real.find((row) => row.isYou)?.xp;
  if (yourXp === undefined) {
    const [[you], [mine]] = await Promise.all([
      db
        .select({ name: user.name })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1),
      db
        .select({ xp: weeklyXp.xp })
        .from(weeklyXp)
        .where(and(eq(weeklyXp.weekStart, week), eq(weeklyXp.userId, userId)))
        .limit(1)
    ]);
    yourXp = mine?.xp ?? 0;
    real.push({
      id: userId,
      name: publicName(you?.name ?? null),
      xp: yourXp,
      isYou: true
    });
  }

  const { entries, hasSeeded } = buildLeaderboard(real, nowMs, size);
  const visibleCount = Math.max(size, 10);
  const ranked = entries.map((entry, index) => ({ ...entry, rank: index + 1 }));
  const rows = ranked.slice(0, visibleCount);
  const yours = ranked.find((row) => row.isYou);

  let yourRow = yours && yours.rank > visibleCount ? yours : null;
  if (yours && yourRow === null && !rows.some((row) => row.isYou)) {
    yourRow = yours;
  }
  if (yourRow) {
    const [ahead] = await db
      .select({ value: count() })
      .from(weeklyXp)
      .where(and(eq(weeklyXp.weekStart, week), gt(weeklyXp.xp, yourXp)));
    yourRow = { ...yourRow, rank: (ahead?.value ?? 0) + 1 };
  }

  return { rows, yourRow, endsAt: weekEndsAt(nowMs), hasSeeded };
}

// Profile, practice, and settings

export async function getProfileView(
  userId: string,
  account: { name: string; createdAt: Date }
): Promise<ProfileView> {
  const nowMs = Date.now();
  const profile = await getProfile(userId, nowMs);
  const today = localDate(nowMs, profile.timeZone);
  const days = Array.from({ length: 7 }, (_, index) =>
    addDays(today, index - 6)
  );

  const [progress, activity, unlocked] = await Promise.all([
    db
      .select({
        lessonId: lessonProgress.lessonId,
        bestAccuracy: lessonProgress.bestAccuracy
      })
      .from(lessonProgress)
      .where(eq(lessonProgress.userId, userId)),
    db
      .select({ date: dailyActivity.date, xp: dailyActivity.xp })
      .from(dailyActivity)
      .where(
        and(
          eq(dailyActivity.userId, userId),
          inArray(dailyActivity.date, days)
        )
      ),
    db
      .select({
        id: userAchievement.achievementId,
        at: userAchievement.unlockedAt
      })
      .from(userAchievement)
      .where(eq(userAchievement.userId, userId))
  ]);

  const unlockedAt = new Map(unlocked.map((row) => [row.id, row.at.getTime()]));
  const xpByDay = new Map(activity.map((row) => [row.date, row.xp]));
  const stats = {
    xp: profile.xp,
    longestStreak: profile.longestStreak,
    lessonsCompleted: progress.length,
    perfectLessons: profile.perfectLessons,
    practiceSessions: profile.practiceSessions,
    mistakesFixed: profile.mistakesFixed,
    dailyGoalsHit: profile.dailyGoalsHit
  };

  return {
    ...stats,
    name: account.name || 'Learner',
    joinedAt: account.createdAt.getTime(),
    streak: currentStreak(profile, today),
    averageAccuracy:
      progress.length > 0
        ? Math.round(
            progress.reduce((sum, row) => sum + row.bestAccuracy, 0) /
              progress.length
          )
        : null,
    week: days.map((date) => ({ date, xp: xpByDay.get(date) ?? 0 })),
    dailyGoal: profile.dailyGoal,
    achievements: achievementList.map((achievement) => ({
      id: achievement.id,
      unlockedAt: unlockedAt.get(achievement.id) ?? null,
      ...achievement.progress(stats)
    }))
  };
}

export async function getPracticeView(userId: string): Promise<PracticeView> {
  const [rows, completed] = await Promise.all([
    db
      .select({
        exerciseId: mistake.exerciseId,
        timesWrong: mistake.timesWrong
      })
      .from(mistake)
      .where(and(eq(mistake.userId, userId), isNull(mistake.resolvedAt)))
      .orderBy(desc(mistake.lastWrongAt))
      .limit(30),
    completedLessonIds(userId)
  ]);
  const mistakes = rows.filter((row) => getExercise(row.exerciseId));
  return {
    mistakes,
    canPractice: mistakes.length > 0 || completed.length > 0
  };
}

export async function updateSettings(
  userId: string,
  input: {
    dailyGoal?: number;
    soundEnabled?: boolean;
    showOnLeaderboard?: boolean;
    timeZone?: string;
  }
): Promise<void> {
  await getProfile(userId, Date.now());
  const allowedGoals: number[] = game.dailyGoalOptions.map(
    (option) => option.xp
  );
  await db
    .update(learnerProfile)
    .set({
      ...(input.dailyGoal !== undefined &&
      allowedGoals.includes(input.dailyGoal)
        ? { dailyGoal: input.dailyGoal }
        : {}),
      ...(input.soundEnabled !== undefined
        ? { soundEnabled: input.soundEnabled }
        : {}),
      ...(input.showOnLeaderboard !== undefined
        ? { showOnLeaderboard: input.showOnLeaderboard }
        : {}),
      ...(input.timeZone !== undefined
        ? { timeZone: safeTimeZone(input.timeZone) }
        : {})
    })
    .where(eq(learnerProfile.userId, userId));
}
