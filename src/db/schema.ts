import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex
} from 'drizzle-orm/sqlite-core';
import type { CompletionSummary } from '~/lib/game-types';

// Better Auth tables. After adding an auth plugin, run
// `pnpm run auth:generate --yes`, copy only its new tables and columns from the
// generated `auth-schema.ts` into this section, then delete that file.

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' })
    .notNull()
    .default(false),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  role: text('role'),
  banned: integer('banned', { mode: 'boolean' }).default(false),
  banReason: text('ban_reason'),
  banExpires: integer('ban_expires', { mode: 'timestamp' })
});

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  impersonatedBy: text('impersonated_by')
});

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', {
    mode: 'timestamp'
  }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', {
    mode: 'timestamp'
  }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date()
  )
});

// Learning progress. All of it is written by the server in `src/server/engine.ts`.

export const learnerProfile = sqliteTable('learner_profile', {
  userId: text('user_id')
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  xp: integer('xp').notNull().default(0),
  hearts: integer('hearts').notNull().default(5),
  // Milliseconds. The moment the current heart refill timer started.
  heartsAnchorMs: integer('hearts_anchor_ms').notNull().default(0),
  streak: integer('streak').notNull().default(0),
  longestStreak: integer('longest_streak').notNull().default(0),
  // YYYY-MM-DD in the learner's own time zone.
  lastActiveDate: text('last_active_date'),
  dailyGoal: integer('daily_goal').notNull().default(20),
  timeZone: text('time_zone').notNull().default('UTC'),
  soundEnabled: integer('sound_enabled', { mode: 'boolean' })
    .notNull()
    .default(true),
  showOnLeaderboard: integer('show_on_leaderboard', { mode: 'boolean' })
    .notNull()
    .default(true),
  perfectLessons: integer('perfect_lessons').notNull().default(0),
  practiceSessions: integer('practice_sessions').notNull().default(0),
  mistakesFixed: integer('mistakes_fixed').notNull().default(0),
  dailyGoalsHit: integer('daily_goals_hit').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
});

export const lessonProgress = sqliteTable(
  'lesson_progress',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    lessonId: text('lesson_id').notNull(),
    timesCompleted: integer('times_completed').notNull().default(1),
    bestAccuracy: integer('best_accuracy').notNull().default(0),
    firstCompletedAt: integer('first_completed_at', {
      mode: 'timestamp'
    }).notNull()
  },
  (table) => [primaryKey({ columns: [table.userId, table.lessonId] })]
);

// One sitting of a lesson or practice session. A guest's row has `guest_token`
// and no `user_id` until they sign up and claim it.
export const lessonAttempt = sqliteTable(
  'lesson_attempt',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
    guestToken: text('guest_token'),
    kind: text('kind', { enum: ['lesson', 'practice'] }).notNull(),
    // A course lesson id, or `practice` for practice sessions.
    lessonId: text('lesson_id').notNull(),
    status: text('status', { enum: ['active', 'completed'] })
      .notNull()
      .default('active'),
    // Exercise ids in the order they're shown. Wrong answers are added to the end.
    queue: text('queue', { mode: 'json' }).$type<string[]>().notNull(),
    position: integer('position').notNull().default(0),
    totalExercises: integer('total_exercises').notNull(),
    // Exercises answered wrong at least once.
    missedIds: text('missed_ids', { mode: 'json' })
      .$type<string[]>()
      .notNull()
      .$defaultFn(() => []),
    // A guest's hearts live on the attempt, since guests have no profile.
    guestHearts: integer('guest_hearts'),
    xpEarned: integer('xp_earned').notNull().default(0),
    accuracy: integer('accuracy'),
    // What the completion screen shows, kept so a reload can show it again.
    summary: text('summary', { mode: 'json' }).$type<CompletionSummary>(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    completedAt: integer('completed_at', { mode: 'timestamp' })
  },
  (table) => [
    index('lesson_attempt_guest_idx').on(table.guestToken),
    index('lesson_attempt_user_idx').on(table.userId),
    // A learner has at most one open attempt per lesson, so retries and double
    // clicks resume it instead of starting another.
    uniqueIndex('lesson_attempt_active_user_idx')
      .on(table.userId, table.lessonId)
      .where(sql`${table.status} = 'active' and ${table.userId} is not null`),
    uniqueIndex('lesson_attempt_active_guest_idx')
      .on(table.guestToken, table.lessonId)
      .where(
        sql`${table.status} = 'active' and ${table.guestToken} is not null`
      )
  ]
);

export const mistake = sqliteTable(
  'mistake',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    exerciseId: text('exercise_id').notNull(),
    timesWrong: integer('times_wrong').notNull().default(1),
    lastWrongAt: integer('last_wrong_at', { mode: 'timestamp' }).notNull(),
    // Set when the learner gets it right in practice. Cleared if they miss it again.
    resolvedAt: integer('resolved_at', { mode: 'timestamp' })
  },
  (table) => [primaryKey({ columns: [table.userId, table.exerciseId] })]
);

export const dailyActivity = sqliteTable(
  'daily_activity',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    // YYYY-MM-DD in the learner's own time zone.
    date: text('date').notNull(),
    xp: integer('xp').notNull().default(0)
  },
  (table) => [primaryKey({ columns: [table.userId, table.date] })]
);

export const weeklyXp = sqliteTable(
  'weekly_xp',
  {
    // The Monday (UTC) that starts the week.
    weekStart: text('week_start').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    xp: integer('xp').notNull().default(0)
  },
  (table) => [
    primaryKey({ columns: [table.weekStart, table.userId] }),
    index('weekly_xp_rank_idx').on(table.weekStart, table.xp)
  ]
);

export const userAchievement = sqliteTable(
  'user_achievement',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    achievementId: text('achievement_id').notNull(),
    unlockedAt: integer('unlocked_at', { mode: 'timestamp' }).notNull()
  },
  (table) => [primaryKey({ columns: [table.userId, table.achievementId] })]
);
