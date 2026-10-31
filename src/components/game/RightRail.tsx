import { Link } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Countdown } from '~/components/game/Countdown';
import { FlameIcon, HeartIcon, XpIcon } from '~/components/game/icons';
import { ProgressBar } from '~/components/game/ProgressBar';
import { GameButton } from '~/components/game/GameButton';
import type { LearnerState } from '~/lib/game-types';
import { leaderboardQuery, learnerStateQuery } from '~/lib/game.queries';
import { cn } from '~/lib/utils';

/** Streak, XP, and hearts, shown on every signed-in page. */
export function StatsRow({ state }: { state: LearnerState }) {
  return (
    <div className='flex items-center gap-3 text-base font-black sm:gap-5'>
      <span
        className={cn(
          'flex items-center gap-1',
          state.streak > 0 ? 'text-orange-500' : 'text-muted-foreground'
        )}
        aria-label={`${state.streak} day streak`}
        data-stat='streak'
      >
        <FlameIcon className='size-6' active={state.streakActiveToday} />
        {state.streak}
      </span>
      <span
        className='flex items-center gap-1 text-brand-accent-dark'
        aria-label={`${state.xp} XP`}
        data-stat='xp'
      >
        <XpIcon className='size-6' />
        {state.xp}
      </span>
      <span
        className='flex items-center gap-1 text-brand-heart'
        aria-label={`${state.hearts} hearts`}
        data-stat='hearts'
      >
        <HeartIcon className='size-6' empty={state.hearts === 0} />
        {state.hearts}
      </span>
    </div>
  );
}

export function DailyGoalCard({ state }: { state: LearnerState }) {
  const done = state.dailyXp >= state.dailyGoal;
  return (
    <section className='rounded-3xl border-2 border-border p-5' data-daily-goal>
      <h2 className='text-lg font-black'>Daily goal</h2>
      <p className='mb-3 text-sm font-semibold text-muted-foreground'>
        {done
          ? 'Goal reached. Nice work today!'
          : `Earn ${state.dailyGoal - state.dailyXp} more XP today.`}
      </p>
      <div className='flex items-center gap-3'>
        <ProgressBar
          tone='accent'
          value={state.dailyXp}
          max={state.dailyGoal}
          label='Daily goal progress'
        />
        <span className='shrink-0 text-sm font-black text-muted-foreground'>
          {Math.min(state.dailyXp, state.dailyGoal)}/{state.dailyGoal}
        </span>
      </div>
    </section>
  );
}

export function HeartsCard({ state }: { state: LearnerState }) {
  const queryClient = useQueryClient();
  return (
    <section className='rounded-3xl border-2 border-border p-5' data-hearts-card>
      <h2 className='text-lg font-black'>Hearts</h2>
      <div className='my-2 flex gap-1'>
        {Array.from({ length: state.maxHearts }, (_, index) => (
          <HeartIcon
            key={index}
            className='size-7'
            empty={index >= state.hearts}
          />
        ))}
      </div>
      <p className='text-sm font-semibold text-muted-foreground'>
        {state.nextHeartAt ? (
          <>
            Next heart in{' '}
            <Countdown
              to={state.nextHeartAt}
              onDone={() =>
                void queryClient.invalidateQueries({
                  queryKey: learnerStateQuery.queryKey
                })
              }
            />
          </>
        ) : (
          'You’re at full hearts.'
        )}
      </p>
    </section>
  );
}

function LeaderboardTeaser() {
  const { data } = useQuery(leaderboardQuery);
  const rows = data?.rows.slice(0, 3) ?? [];
  const you = data?.yourRow ?? data?.rows.find((row) => row.isYou);
  return (
    <section className='rounded-3xl border-2 border-border p-5'>
      <div className='mb-2 flex items-center justify-between'>
        <h2 className='text-lg font-black'>This week</h2>
        <Link
          to='/dashboard/leaderboard'
          className='text-xs font-black tracking-wide text-brand-primary uppercase'
        >
          View all
        </Link>
      </div>
      <ol className='space-y-1.5 text-sm font-bold'>
        {rows.map((row) => (
          <li key={row.id} className='flex justify-between gap-2'>
            <span className={cn('truncate', row.isYou && 'text-brand-primary')}>
              {row.rank}. {row.name}
            </span>
            <span className='shrink-0 text-muted-foreground'>{row.xp} XP</span>
          </li>
        ))}
      </ol>
      {you && you.rank > 3 ? (
        <p className='mt-2 border-t-2 border-border pt-2 text-sm font-extrabold text-brand-primary'>
          You’re #{you.rank} with {you.xp} XP
        </p>
      ) : null}
    </section>
  );
}

/** The right column on wide screens. On smaller screens these cards sit in the page itself. */
export function RightRail({ state }: { state: LearnerState }) {
  return (
    <aside className='hidden w-80 shrink-0 xl:block'>
      <div className='sticky top-5 space-y-4'>
        <div className='flex justify-center'>
          <StatsRow state={state} />
        </div>
        <DailyGoalCard state={state} />
        <HeartsCard state={state} />
        <LeaderboardTeaser />
        {state.mistakesCount > 0 ? (
          <section className='rounded-3xl border-2 border-border p-5'>
            <h2 className='text-lg font-black'>Fix your mistakes</h2>
            <p className='mb-3 text-sm font-semibold text-muted-foreground'>
              {state.mistakesCount === 1
                ? '1 mistake is'
                : `${state.mistakesCount} mistakes are`}{' '}
              waiting for review.
            </p>
            <GameButton asChild variant='outline' size='sm' className='w-full'>
              <Link to='/dashboard/practice'>Practice</Link>
            </GameButton>
          </section>
        ) : null}
      </div>
    </aside>
  );
}
