import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { Mascot } from '~/components/brand/Mascot';
import { Countdown } from '~/components/game/Countdown';
import { GameButton } from '~/components/game/GameButton';
import { LessonPlayer, type SubmitFn } from '~/components/lesson/LessonPlayer';
import type { StartResult } from '~/lib/game-types';

function Message({
  pose,
  title,
  children
}: {
  pose: 'sad' | 'think' | 'idle';
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className='flex min-h-dvh flex-col items-center justify-center gap-4 bg-card px-6 text-center'>
      <Mascot pose={pose} animate='bob' className='size-36' />
      <h1 className='text-2xl font-black'>{title}</h1>
      {children}
    </div>
  );
}

/** Starts or resumes a signed-in learner's lesson, then hands it to the player. */
export function LessonSession({
  start,
  submit,
  exitTo = '/dashboard'
}: {
  start: () => Promise<StartResult>;
  submit: SubmitFn;
  exitTo?: '/dashboard' | '/dashboard/practice';
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [result, setResult] = useState<StartResult | null>(null);
  const [failed, setFailed] = useState(false);
  const started = useRef(false);

  const load = () => {
    setFailed(false);
    start().then(setResult, () => setFailed(true));
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    load();
    // Starting is a write, so it runs once for this page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const leave = () => {
    void queryClient.invalidateQueries({ queryKey: ['learner'] });
    void navigate({ to: exitTo });
  };

  if (failed) {
    return (
      <Message pose='sad' title='We couldn’t load this lesson'>
        <GameButton onClick={load}>Try again</GameButton>
        <GameButton asChild variant='ghost'>
          <Link to={exitTo}>Go back</Link>
        </GameButton>
      </Message>
    );
  }
  if (!result) {
    return (
      <div className='grid min-h-dvh place-items-center bg-card' role='status'>
        <Mascot pose='idle' animate='bob' className='size-32' />
        <span className='sr-only'>Loading your lesson</span>
      </div>
    );
  }
  switch (result.status) {
    case 'ok':
      return (
        <LessonPlayer
          initial={result.attempt}
          isGuest={false}
          submit={submit}
          onExit={leave}
          onFinished={leave}
        />
      );
    case 'locked':
      return (
        <Message pose='think' title='This lesson is still locked'>
          <p className='font-semibold text-muted-foreground'>
            Finish the lessons before it on your path first.
          </p>
          <GameButton asChild>
            <Link to='/dashboard'>Back to the path</Link>
          </GameButton>
        </Message>
      );
    case 'out_of_hearts':
      return (
        <Message pose='sad' title='You’re out of hearts'>
          <p className='max-w-md font-semibold text-muted-foreground'>
            Practice your past mistakes to earn a heart back now, or wait for
            one to refill.
          </p>
          {result.nextHeartAt ? (
            <p className='font-extrabold text-brand-danger' data-next-heart>
              Next heart in <Countdown to={result.nextHeartAt} onDone={load} />
            </p>
          ) : null}
          <GameButton asChild size='lg'>
            <Link to='/dashboard/practice-session'>Practice to earn a heart</Link>
          </GameButton>
          <GameButton asChild variant='ghost'>
            <Link to='/dashboard'>Back to the path</Link>
          </GameButton>
        </Message>
      );
    case 'empty':
      return (
        <Message pose='think' title='Nothing to practice yet'>
          <p className='font-semibold text-muted-foreground'>
            Finish a lesson first, and it will be ready to practice.
          </p>
          <GameButton asChild>
            <Link to='/dashboard'>Back to the path</Link>
          </GameButton>
        </Message>
      );
    case 'not_found':
      return (
        <Message pose='think' title='We can’t find that lesson'>
          <GameButton asChild>
            <Link to='/dashboard'>Back to the path</Link>
          </GameButton>
        </Message>
      );
  }
}
