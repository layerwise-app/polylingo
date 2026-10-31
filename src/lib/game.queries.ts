import { queryOptions } from '@tanstack/react-query';
import {
  fetchLeaderboard,
  fetchLearnerState,
  fetchPractice,
  fetchProfile
} from '~/lib/game.functions';

export const learnerStateQuery = queryOptions({
  queryKey: ['learner', 'state'],
  queryFn: () => fetchLearnerState(),
  staleTime: 15_000
});

export const leaderboardQuery = queryOptions({
  queryKey: ['learner', 'leaderboard'],
  queryFn: () => fetchLeaderboard(),
  staleTime: 30_000
});

export const profileQuery = queryOptions({
  queryKey: ['learner', 'profile'],
  queryFn: () => fetchProfile()
});

export const practiceQuery = queryOptions({
  queryKey: ['learner', 'practice'],
  queryFn: () => fetchPractice()
});
