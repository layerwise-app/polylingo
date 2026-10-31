/** Shapes the server sends to the browser. */

export type AttemptKind = 'lesson' | 'practice';

export type CompletionSummary = {
  kind: AttemptKind;
  lessonId: string;
  xpEarned: number;
  accuracy: number;
  perfect: boolean;
  total: number;
  missed: number;
  streak: number;
  /** The streak grew because of this session. */
  streakExtended: boolean;
  dailyXp: number;
  dailyGoal: number;
  goalJustMet: boolean;
  heartsEarned: number;
  hearts: number;
  newAchievements: string[];
  courseComplete: boolean;
  nextLessonId: string | null;
};

export type AttemptView = {
  id: string;
  kind: AttemptKind;
  lessonId: string;
  queue: string[];
  position: number;
  totalExercises: number;
  /** Null during practice, which never costs hearts. */
  hearts: number | null;
  nextHeartAt: number | null;
  summary: CompletionSummary | null;
};

export type StartResult =
  | { status: 'ok'; attempt: AttemptView }
  | { status: 'locked' }
  | { status: 'not_found' }
  | { status: 'empty' }
  | { status: 'out_of_hearts'; nextHeartAt: number | null };

export type CheckResult = {
  status: 'ok' | 'out_of_hearts' | 'out_of_sync';
  correct: boolean;
  canonical: string;
  accentFix: boolean;
  attempt: AttemptView;
};

export type LearnerState = {
  hearts: number;
  maxHearts: number;
  nextHeartAt: number | null;
  xp: number;
  streak: number;
  longestStreak: number;
  /** Today's learning is done, so the streak is safe. */
  streakActiveToday: boolean;
  dailyXp: number;
  dailyGoal: number;
  soundEnabled: boolean;
  showOnLeaderboard: boolean;
  completedLessonIds: string[];
  currentLessonId: string | null;
  /** How far along each unfinished lesson is, from 0 to 1. */
  lessonProgress: Record<string, number>;
  mistakesCount: number;
  courseComplete: boolean;
};

export type LeaderboardRow = {
  id: string;
  rank: number;
  name: string;
  xp: number;
  isYou: boolean;
};

export type LeaderboardView = {
  rows: LeaderboardRow[];
  /** Set when the learner sits below the visible rows. */
  yourRow: LeaderboardRow | null;
  endsAt: number;
  hasSeeded: boolean;
};

export type ProfileView = {
  name: string;
  joinedAt: number;
  xp: number;
  streak: number;
  longestStreak: number;
  lessonsCompleted: number;
  perfectLessons: number;
  practiceSessions: number;
  mistakesFixed: number;
  dailyGoalsHit: number;
  averageAccuracy: number | null;
  /** The last 7 days, oldest first. */
  week: { date: string; xp: number }[];
  dailyGoal: number;
  achievements: {
    id: string;
    unlockedAt: number | null;
    current: number;
    target: number;
  }[];
};

export type PracticeView = {
  /** Mistakes to review, most recent first. */
  mistakes: { exerciseId: string; timesWrong: number }[];
  canPractice: boolean;
};

export type ClaimResult = {
  claimed: 'completed' | 'in_progress' | null;
  xp: number;
};
