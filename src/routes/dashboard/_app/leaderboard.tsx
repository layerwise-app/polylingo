import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Art } from '~/components/art/Art';
import { Countdown } from '~/components/game/Countdown';
import { brand } from '~/brand.config';
import { game } from '~/config/game';
import type { LeaderboardRow } from '~/lib/game-types';
import { leaderboardQuery } from '~/lib/game.queries';
import { cn } from '~/lib/utils';
import { seo } from '~/utils/seo';

export const Route = createFileRoute('/dashboard/_app/leaderboard')({
  head: () => seo({ title: `Leaderboard | ${brand.name}`, noindex: true }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(leaderboardQuery),
  component: LeaderboardPage
});

const avatarColors = [
  'bg-sky-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-orange-500',
  'bg-teal-500'
];

function avatarColor(name: string): string {
  let total = 0;
  for (const character of name) total += character.charCodeAt(0);
  return avatarColors[total % avatarColors.length]!;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

const medalColor = ['bg-brand-accent', 'bg-slate-300', 'bg-amber-600 text-white'];

function Row({ row }: { row: LeaderboardRow }) {
  const isMedal = row.rank <= game.leaderboard.medalPlaces;
  return (
    <li
      data-leaderboard-row={row.isYou ? 'you' : 'other'}
      className={cn(
        'flex items-center gap-3 rounded-2xl px-3 py-2.5',
        row.isYou && 'bg-brand-primary-soft ring-2 ring-brand-primary'
      )}
    >
      <span
        className={cn(
          'grid size-8 shrink-0 place-items-center rounded-full text-sm font-black',
          isMedal ? medalColor[row.rank - 1] : 'text-muted-foreground'
        )}
      >
        {row.rank}
      </span>
      <span
        aria-hidden
        className={cn(
          'grid size-11 shrink-0 place-items-center rounded-full text-sm font-black text-white',
          avatarColor(row.name)
        )}
      >
        {initials(row.name)}
      </span>
      <span
        className={cn(
          'min-w-0 flex-1 truncate font-extrabold',
          row.isYou && 'text-brand-primary'
        )}
      >
        {row.name}
        {row.isYou ? ' (you)' : ''}
      </span>
      <span className='shrink-0 font-bold text-muted-foreground tabular-nums'>
        {row.xp} XP
      </span>
    </li>
  );
}

function LeaderboardPage() {
  const { data } = useSuspenseQuery(leaderboardQuery);
  return (
    <div className='flex flex-col gap-4'>
      <section className='flex flex-col items-center text-center'>
        <Art name='badge-trophy' className='size-20' />
        <h1 className='mt-2 text-2xl font-black'>Weekly leaderboard</h1>
        <p className='font-semibold text-muted-foreground'>
          Earn XP to climb. A new week starts in{' '}
          <span className='font-extrabold text-brand-accent-dark'>
            <Countdown to={data.endsAt} />
          </span>
        </p>
      </section>
      <ol className='flex flex-col gap-1' data-leaderboard>
        {data.rows.map((row) => (
          <Row key={row.id} row={row} />
        ))}
      </ol>
      {data.yourRow ? (
        <ol className='border-t-2 border-border pt-2'>
          <Row row={data.yourRow} />
        </ol>
      ) : null}
      {data.hasSeeded && game.leaderboard.seededDisclosure ? (
        <p className='text-center text-xs font-semibold text-muted-foreground'>
          {game.leaderboard.seededDisclosure}
        </p>
      ) : null}
    </div>
  );
}
