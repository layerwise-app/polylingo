/** Badges on the profile page. The server unlocks them after each session. */

export type AchievementStats = {
  xp: number;
  longestStreak: number;
  lessonsCompleted: number;
  perfectLessons: number;
  practiceSessions: number;
  mistakesFixed: number;
  dailyGoalsHit: number;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  /** Illustration key for the badge. */
  art: string;
  unlocked: (stats: AchievementStats) => boolean;
  /** Progress toward the badge, shown while it is locked. */
  progress: (stats: AchievementStats) => { current: number; target: number };
};

function milestone(
  stat: keyof AchievementStats,
  target: number,
  details: Pick<Achievement, 'id' | 'title' | 'description' | 'art'>
): Achievement {
  return {
    ...details,
    unlocked: (stats) => stats[stat] >= target,
    progress: (stats) => ({
      current: Math.min(stats[stat], target),
      target
    })
  };
}

export const achievements: Achievement[] = [
  milestone('lessonsCompleted', 1, {
    id: 'first-words',
    title: 'First Words',
    description: 'Finish your first lesson.',
    art: 'wave'
  }),
  milestone('perfectLessons', 1, {
    id: 'flawless',
    title: 'Flawless',
    description: 'Finish a lesson without a single mistake.',
    art: 'badge-star'
  }),
  milestone('longestStreak', 3, {
    id: 'warming-up',
    title: 'Warming Up',
    description: 'Reach a 3-day streak.',
    art: 'badge-flame'
  }),
  milestone('longestStreak', 7, {
    id: 'week-on-fire',
    title: 'Week on Fire',
    description: 'Reach a 7-day streak.',
    art: 'badge-flame'
  }),
  milestone('dailyGoalsHit', 1, {
    id: 'goal-getter',
    title: 'Goal Getter',
    description: 'Hit your daily goal.',
    art: 'badge-target'
  }),
  milestone('xp', 100, {
    id: 'century',
    title: 'Century',
    description: 'Earn 100 XP.',
    art: 'badge-bolt'
  }),
  milestone('practiceSessions', 1, {
    id: 'back-for-more',
    title: 'Back for More',
    description: 'Finish a practice session.',
    art: 'badge-heart'
  }),
  milestone('mistakesFixed', 10, {
    id: 'mistake-mender',
    title: 'Mistake Mender',
    description: 'Correct 10 past mistakes in practice.',
    art: 'badge-heart'
  }),
  milestone('lessonsCompleted', 5, {
    id: 'halfway-there',
    title: 'Halfway There',
    description: 'Finish 5 lessons.',
    art: 'badge-medal'
  }),
  milestone('lessonsCompleted', 10, {
    id: 'course-champion',
    title: 'Course Champion',
    description: 'Finish all 10 lessons.',
    art: 'badge-trophy'
  })
];

export function getAchievement(id: string): Achievement | undefined {
  return achievements.find((achievement) => achievement.id === id);
}
