/** Game rules. The server applies these whenever it calculates a learner's progress. */
export const game = {
  xp: {
    /** First time finishing a lesson. */
    lessonFirstTime: 15,
    /** Extra XP for a lesson with no mistakes. */
    perfectBonus: 5,
    /** Replaying a lesson that's already complete. */
    lessonReplay: 5,
    /** Finishing a practice session. */
    practice: 10
  },
  hearts: {
    max: 5,
    /** One heart comes back every this many minutes. */
    refillMinutes: 60,
    /** Hearts restored by finishing a practice session. */
    practiceReward: 1
  },
  /** Daily XP goals a learner can choose from in settings. */
  dailyGoalOptions: [
    { xp: 10, label: 'Casual' },
    { xp: 20, label: 'Regular' },
    { xp: 30, label: 'Serious' },
    { xp: 50, label: 'Intense' }
  ],
  defaultDailyGoal: 20,
  practice: {
    /** Exercises in one practice session. */
    size: 8
  },
  /** OpenAI requires telling listeners that the course's voice isn't a person. Keep it visible. */
  voiceDisclosure: 'The Spanish voice you hear is AI-generated, not a human voice.',
  leaderboard: {
    /** Seeded learners top the board up to this size. Use 0 to show only real users. */
    size: 20,
    /** How many of the top places count as the medal zone. */
    medalPlaces: 3,
    /** Shown under the board while seeded learners are on it. Empty hides it. */
    seededDisclosure: 'Some learners on this board are sample profiles.'
  }
} as const;
