import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Art } from '~/components/art/Art';
import { Mascot } from '~/components/brand/Mascot';
import { Confetti } from '~/components/game/Confetti';
import { GameButton } from '~/components/game/GameButton';
import { FlameIcon, HeartIcon, XpIcon } from '~/components/game/icons';
import { ProgressBar } from '~/components/game/ProgressBar';
import { brand } from '~/brand.config';
import { getAchievement } from '~/content/achievements';
import type { CompletionSummary } from '~/lib/game-types';
import { playSound } from '~/lib/sfx';
import { cn } from '~/lib/utils';

function useCountUp(target: number) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / 800);
      setValue(Math.round(target * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return value;
}

function StatCard({
  label,
  value,
  icon,
  tone,
  delay
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: string;
  delay: number;
}) {
  return (
    <div
      className={cn(
        'animate-rise-in overflow-hidden rounded-2xl border-2 text-center',
        tone
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className='py-1 text-xs font-black tracking-wide text-white uppercase'>
        {label}
      </p>
      <div className='m-0.5 mt-0 flex items-center justify-center gap-1.5 rounded-b-[0.8rem] bg-card py-3 text-2xl font-black'>
        {icon}
        {value}
      </div>
    </div>
  );
}

export function CompletionScreen({
  summary,
  isGuest,
  onContinue
}: {
  summary: CompletionSummary;
  isGuest: boolean;
  onContinue: () => void;
}) {
  const xp = useCountUp(summary.xpEarned);

  useEffect(() => {
    playSound('complete');
  }, []);

  const title =
    summary.kind === 'practice'
      ? 'Practice complete!'
      : summary.courseComplete
        ? '¡Felicidades! Course complete!'
        : summary.perfect
          ? 'Perfect lesson!'
          : 'Lesson complete!';

  return (
    <div className='flex min-h-dvh flex-col bg-card' data-completion-screen>
      <Confetti />
      <main className='mx-auto flex w-full max-w-lg flex-1 flex-col items-center gap-5 px-5 pt-8 pb-6 text-center'>
        <Mascot pose='cheer' animate='celebrate' className='size-36 sm:size-44' />
        <div>
          <h1 className='text-3xl font-black tracking-tight text-brand-accent-dark sm:text-4xl'>
            {title}
          </h1>
          <p className='mt-1 font-bold text-muted-foreground'>
            {summary.perfect
              ? `${brand.mascot.name} is doing a happy dance. Not one mistake!`
              : `${brand.mascot.name} is proud of you. Your repeats paid off!`}
          </p>
        </div>

        <div className='grid w-full grid-cols-3 gap-2 sm:gap-3'>
          <StatCard
            label='XP earned'
            value={`+${xp}`}
            icon={<XpIcon className='size-6' />}
            tone='border-brand-accent bg-brand-accent-dark'
            delay={100}
          />
          <StatCard
            label='Accuracy'
            value={`${summary.accuracy}%`}
            icon={null}
            tone='border-brand-success bg-brand-success'
            delay={220}
          />
          <StatCard
            label='Streak'
            value={String(summary.streak)}
            icon={<FlameIcon className='size-6' />}
            tone='border-brand-primary bg-brand-primary'
            delay={340}
          />
        </div>

        {summary.heartsEarned > 0 ? (
          <p className='animate-rise-in flex items-center gap-2 rounded-2xl bg-brand-danger-soft px-4 py-2 font-extrabold text-brand-danger'>
            <HeartIcon className='animate-heart-pop size-6' />
            You earned {summary.heartsEarned} heart back
          </p>
        ) : null}

        {!isGuest ? (
          <div className='w-full rounded-2xl border-2 border-border p-4 text-left'>
            <div className='mb-2 flex justify-between text-sm font-extrabold'>
              <span>
                {summary.goalJustMet ? 'Daily goal reached!' : 'Daily goal'}
              </span>
              <span className='text-muted-foreground'>
                {Math.min(summary.dailyXp, summary.dailyGoal)} /{' '}
                {summary.dailyGoal} XP
              </span>
            </div>
            <ProgressBar
              tone='accent'
              value={summary.dailyXp}
              max={summary.dailyGoal}
              label='Daily goal progress'
            />
          </div>
        ) : null}

        {summary.newAchievements.length > 0 ? (
          <div className='w-full space-y-2'>
            {summary.newAchievements.map((id, index) => {
              const achievement = getAchievement(id);
              if (!achievement) return null;
              return (
                <div
                  key={id}
                  className='animate-pop-in flex items-center gap-3 rounded-2xl bg-brand-accent-soft p-3 text-left'
                  style={{ animationDelay: `${400 + index * 120}ms` }}
                >
                  <Art name={achievement.art} className='size-12 shrink-0' />
                  <div>
                    <p className='text-xs font-black tracking-wide text-brand-accent-ink uppercase'>
                      Achievement unlocked
                    </p>
                    <p className='font-extrabold'>{achievement.title}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {isGuest ? (
          <div
            data-signup-prompt
            className='animate-rise-in w-full rounded-3xl border-2 border-brand-primary bg-brand-primary-soft p-5'
            style={{ animationDelay: '500ms' }}
          >
            <h2 className='text-xl font-black'>Keep what you just earned</h2>
            <p className='mt-1 font-semibold text-muted-foreground'>
              Create a free account to save this lesson, your XP, and your
              streak. Then unlock Introductions, Numbers, and the rest of the
              path.
            </p>
          </div>
        ) : null}
      </main>

      <footer className='border-t-2 border-border bg-card p-4'>
        <div className='mx-auto flex w-full max-w-lg flex-col gap-3'>
          {isGuest ? (
            <>
              <GameButton asChild size='lg' className='w-full'>
                <Link to='/sign-up' data-testid='guest-sign-up'>
                  Create free account
                </Link>
              </GameButton>
              <GameButton
                variant='ghost'
                className='w-full'
                onClick={onContinue}
              >
                Maybe later
              </GameButton>
            </>
          ) : (
            <GameButton
              size='lg'
              className='w-full'
              onClick={onContinue}
              data-testid='completion-continue'
              autoFocus
            >
              Continue
            </GameButton>
          )}
        </div>
      </footer>
    </div>
  );
}
