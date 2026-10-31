import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Settings } from 'lucide-react';
import { Art } from '~/components/art/Art';
import { GameButton } from '~/components/game/GameButton';
import { FlameIcon, XpIcon } from '~/components/game/icons';
import { ProgressBar } from '~/components/game/ProgressBar';
import { brand } from '~/brand.config';
import { achievements } from '~/content/achievements';
import { lessons } from '~/content/course';
import { profileQuery } from '~/lib/game.queries';
import { cn } from '~/lib/utils';
import { seo } from '~/utils/seo';

export const Route = createFileRoute('/dashboard/_app/profile')({
  head: () => seo({ title: `Profile | ${brand.name}`, noindex: true }),
  loader: ({ context }) => context.queryClient.ensureQueryData(profileQuery),
  component: ProfilePage
});

const joinedFormat = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC'
});
const dayFormat = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  timeZone: 'UTC'
});

function Stat({
  icon,
  value,
  label
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className='flex items-center gap-3 rounded-2xl border-2 border-border p-3'>
      <span className='grid size-9 shrink-0 place-items-center'>{icon}</span>
      <div className='min-w-0'>
        <p className='text-xl leading-tight font-black tabular-nums'>{value}</p>
        <p className='truncate text-xs font-bold text-muted-foreground'>
          {label}
        </p>
      </div>
    </div>
  );
}

function ProfilePage() {
  const { data: profile } = useSuspenseQuery(profileQuery);
  const highest = Math.max(profile.dailyGoal, ...profile.week.map((day) => day.xp));
  const unlockedCount = profile.achievements.filter((a) => a.unlockedAt).length;

  return (
    <div className='flex flex-col gap-6'>
      <section className='flex items-center gap-4'>
        <span
          aria-hidden
          className='grid size-20 shrink-0 place-items-center rounded-full bg-brand-primary text-3xl font-black text-white'
        >
          {profile.name.charAt(0).toUpperCase()}
        </span>
        <div className='min-w-0 flex-1'>
          <h1 className='truncate text-2xl font-black' data-profile-name>
            {profile.name}
          </h1>
          <p className='text-sm font-semibold text-muted-foreground'>
            Joined {joinedFormat.format(new Date(profile.joinedAt))}
          </p>
        </div>
        <GameButton asChild variant='outline' size='sm' className='lg:hidden'>
          <Link to='/dashboard/settings' aria-label='Settings'>
            <Settings className='size-5' />
          </Link>
        </GameButton>
      </section>

      <section>
        <h2 className='mb-3 text-lg font-black'>Statistics</h2>
        <div className='grid grid-cols-2 gap-3' data-profile-stats>
          <Stat
            icon={<FlameIcon className='size-8' active={profile.streak > 0} />}
            value={profile.streak}
            label='Day streak'
          />
          <Stat
            icon={<XpIcon className='size-8' />}
            value={profile.xp}
            label='Total XP'
          />
          <Stat
            icon={<Art name='badge-medal' className='size-8' />}
            value={`${profile.lessonsCompleted}/${lessons.length}`}
            label='Lessons finished'
          />
          <Stat
            icon={<Art name='badge-target' className='size-8' />}
            value={
              profile.averageAccuracy === null
                ? '–'
                : `${profile.averageAccuracy}%`
            }
            label='Average accuracy'
          />
          <Stat
            icon={<FlameIcon className='size-8' />}
            value={profile.longestStreak}
            label='Longest streak'
          />
          <Stat
            icon={<Art name='badge-star' className='size-8' />}
            value={profile.perfectLessons}
            label='Perfect lessons'
          />
        </div>
      </section>

      <section>
        <h2 className='mb-3 text-lg font-black'>Last 7 days</h2>
        <div
          className='flex h-40 items-end gap-2 rounded-3xl border-2 border-border p-4'
          role='img'
          aria-label={`XP per day: ${profile.week.map((day) => `${dayFormat.format(new Date(`${day.date}T00:00:00Z`))} ${day.xp}`).join(', ')}`}
        >
          {profile.week.map((day) => (
            <div
              key={day.date}
              className='flex h-full flex-1 flex-col items-center justify-end gap-1'
            >
              {day.xp > 0 ? (
                <span className='text-xs font-black text-brand-accent-dark'>
                  {day.xp}
                </span>
              ) : null}
              <div
                className={cn(
                  'w-full max-w-9 rounded-t-lg',
                  day.xp >= profile.dailyGoal
                    ? 'bg-brand-accent'
                    : day.xp > 0
                      ? 'bg-brand-primary'
                      : 'bg-border'
                )}
                style={{ height: `${Math.max(6, (day.xp / highest) * 70)}%` }}
              />
              <span className='text-xs font-bold text-muted-foreground'>
                {dayFormat.format(new Date(`${day.date}T00:00:00Z`)).charAt(0)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className='mb-3 flex items-baseline justify-between'>
          <h2 className='text-lg font-black'>Achievements</h2>
          <span className='text-sm font-extrabold text-muted-foreground' data-achievement-count>
            {unlockedCount} of {achievements.length}
          </span>
        </div>
        <ul className='flex flex-col gap-2'>
          {achievements.map((achievement) => {
            const state = profile.achievements.find(
              (item) => item.id === achievement.id
            );
            const unlocked = Boolean(state?.unlockedAt);
            return (
              <li
                key={achievement.id}
                data-achievement={achievement.id}
                data-unlocked={unlocked}
                className={cn(
                  'flex items-center gap-4 rounded-2xl border-2 p-3',
                  unlocked
                    ? 'border-brand-accent bg-brand-accent-soft'
                    : 'border-border'
                )}
              >
                <Art
                  name={achievement.art}
                  className={cn('size-12 shrink-0', !unlocked && 'opacity-40 grayscale')}
                />
                <div className='min-w-0 flex-1'>
                  <p className='font-black'>{achievement.title}</p>
                  <p className='text-sm font-semibold text-muted-foreground'>
                    {achievement.description}
                  </p>
                  {!unlocked && state && state.target > 1 ? (
                    <div className='mt-1.5 flex items-center gap-2'>
                      <ProgressBar
                        tone='accent'
                        className='h-2.5'
                        value={state.current}
                        max={state.target}
                        label={`${achievement.title} progress`}
                      />
                      <span className='shrink-0 text-xs font-black text-muted-foreground'>
                        {state.current}/{state.target}
                      </span>
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
