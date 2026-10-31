import { useEffect, useRef, useState } from 'react';
import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router';
import { Mascot } from '~/components/brand/Mascot';
import { GameButton } from '~/components/game/GameButton';
import { LessonPlayer } from '~/components/lesson/LessonPlayer';
import { brand } from '~/brand.config';
import { freeLessonId, getLesson } from '~/content/course';
import { getAuthSession } from '~/lib/auth.functions';
import { startGuestLesson, submitGuestAnswer } from '~/lib/game.functions';
import type { AttemptView } from '~/lib/game-types';
import { getGuestToken } from '~/lib/guest';
import { seo } from '~/utils/seo';

const lessonTitle = getLesson(freeLessonId)!.title;

export const Route = createFileRoute('/try')({
  beforeLoad: async () => {
    if (await getAuthSession()) throw redirect({ to: '/dashboard' });
  },
  head: () =>
    seo({
      title: `Try a free ${brand.language} lesson | ${brand.name}`,
      description: `Start with ${lessonTitle}, a free beginner ${brand.language} lesson. No account needed, and your progress carries over if you sign up.`,
      path: '/try'
    }),
  component: TryPage
});

function TryPage() {
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<AttemptView | null>(null);
  const [failed, setFailed] = useState(false);
  // A new key remounts the player when the lesson starts over.
  const [session, setSession] = useState(0);
  const started = useRef(false);

  const load = (restart: boolean) => {
    setFailed(false);
    startGuestLesson({ data: { guestToken: getGuestToken(), restart } }).then(
      (result) => {
        if (result.status === 'ok') {
          setAttempt(result.attempt);
          setSession((value) => value + 1);
        } else {
          setFailed(true);
        }
      },
      () => setFailed(true)
    );
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (failed) {
    return (
      <div className='flex min-h-dvh flex-col items-center justify-center gap-4 bg-card px-6 text-center'>
        <Mascot pose='sad' className='size-36' />
        <h1 className='text-2xl font-black'>We couldn’t load this lesson</h1>
        <GameButton onClick={() => load(false)}>Try again</GameButton>
        <GameButton asChild variant='ghost'>
          <Link to='/'>Back home</Link>
        </GameButton>
      </div>
    );
  }
  if (!attempt) {
    return (
      <div className='grid min-h-dvh place-items-center bg-card' role='status'>
        <Mascot pose='wave' animate='bob' className='size-32' />
        <span className='sr-only'>Loading your free lesson</span>
      </div>
    );
  }
  return (
    <LessonPlayer
      key={session}
      initial={attempt}
      isGuest
      submit={(input) =>
        submitGuestAnswer({
          data: { ...input, guestToken: getGuestToken() }
        })
      }
      onExit={() => void navigate({ to: '/' })}
      onFinished={() => void navigate({ to: '/' })}
      onRestart={() => load(true)}
    />
  );
}
