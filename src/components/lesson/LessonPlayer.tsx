import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Check, Lightbulb, RotateCcw, Volume2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Mascot } from '~/components/brand/Mascot';
import { Countdown } from '~/components/game/Countdown';
import { GameButton } from '~/components/game/GameButton';
import { HeartIcon } from '~/components/game/icons';
import { ProgressBar } from '~/components/game/ProgressBar';
import { CompletionScreen } from '~/components/lesson/CompletionScreen';
import { ExerciseView } from '~/components/lesson/exercises';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from '~/components/ui/dialog';
import { brand } from '~/brand.config';
import { game } from '~/config/game';
import {
  describeExercise,
  exerciseSpeech,
  getExercise
} from '~/content/course';
import type { Exercise } from '~/content/types';
import type { AttemptView, CheckResult } from '~/lib/game-types';
import type { Answer } from '~/lib/grading';
import { isSoundEnabled, playSound } from '~/lib/sfx';
import { playSpeech, preloadSpeech } from '~/lib/speech-player';
import { cn } from '~/lib/utils';

const praise = ['Nice!', 'Great job!', 'Awesome!', '¡Excelente!', 'You got it!', '¡Muy bien!'];

export type SubmitFn = (input: {
  attemptId: string;
  position: number;
  exerciseId: string;
  answer: Answer;
}) => Promise<CheckResult>;

function solved(attempt: AttemptView, position: number): number {
  const repeats = attempt.queue.length - attempt.totalExercises;
  return Math.max(0, position - repeats);
}

function FeedbackAnswer({
  exercise,
  feedback
}: {
  exercise: Exercise;
  feedback: CheckResult;
}) {
  const label = describeExercise(exercise);
  const speech = exerciseSpeech(exercise);
  if (exercise.type === 'match_pairs') {
    return feedback.correct ? null : (
      <div className='mt-1 grid grid-cols-1 gap-x-4 font-bold sm:grid-cols-2'>
        {exercise.pairs.map((pair) => (
          <p key={pair.es}>
            <span lang='es'>{pair.es}</span>{' '}
            <span className='font-semibold opacity-80'>= {pair.en}</span>
          </p>
        ))}
      </div>
    );
  }
  return (
    <div className='mt-1'>
      {!feedback.correct || feedback.accentFix ? (
        <p className='text-sm font-extrabold uppercase opacity-80'>
          {feedback.accentFix ? 'Correct spelling' : 'Correct answer'}
        </p>
      ) : null}
      <div className='flex items-center gap-2'>
        {speech ? (
          <button
            type='button'
            aria-label='Hear the answer'
            onClick={() => void playSpeech(speech)}
            className='cursor-pointer rounded-lg p-1 hover:bg-black/5'
          >
            <Volume2 className='size-5' />
          </button>
        ) : null}
        <p lang='es' data-canonical className='text-lg font-black'>
          {feedback.canonical}
        </p>
      </div>
      <p className='font-semibold opacity-90'>{label.en}</p>
    </div>
  );
}

function OutOfHearts({
  nextHeartAt,
  isGuest,
  onRestart,
  onWaited
}: {
  nextHeartAt: number | null;
  isGuest: boolean;
  onRestart?: () => void;
  onWaited: () => void;
}) {
  return (
    <div
      data-out-of-hearts
      className='flex min-h-dvh flex-col items-center justify-center gap-5 bg-card px-6 text-center'
    >
      <Mascot pose='sad' animate='droop' className='size-40' />
      <div className='flex gap-1'>
        <HeartIcon empty className='size-8' />
      </div>
      <div>
        <h1 className='text-3xl font-black'>You’re out of hearts</h1>
        <p className='mt-2 max-w-md font-semibold text-muted-foreground'>
          {isGuest
            ? 'Mistakes happen. Start the lesson over, or create a free account to save your progress and earn hearts back in practice.'
            : 'Practice your past mistakes to earn a heart back now, or wait for one to refill.'}
        </p>
        {nextHeartAt ? (
          <p className='mt-2 font-extrabold text-brand-danger'>
            Next heart in <Countdown to={nextHeartAt} onDone={onWaited} />
          </p>
        ) : null}
      </div>
      <div className='flex w-full max-w-sm flex-col gap-3'>
        {isGuest ? (
          <>
            <GameButton asChild size='lg'>
              <Link to='/sign-up'>Create free account</Link>
            </GameButton>
            <GameButton variant='outline' onClick={onRestart}>
              <RotateCcw className='size-4' />
              Start the lesson over
            </GameButton>
          </>
        ) : (
          <>
            <GameButton asChild size='lg'>
              <Link to='/dashboard/practice-session'>Practice to earn a heart</Link>
            </GameButton>
            <GameButton asChild variant='ghost'>
              <Link to='/dashboard'>Back to the path</Link>
            </GameButton>
          </>
        )}
      </div>
    </div>
  );
}

export function LessonPlayer({
  initial,
  isGuest,
  submit,
  onExit,
  onFinished,
  onRestart
}: {
  initial: AttemptView;
  isGuest: boolean;
  submit: SubmitFn;
  /** Leaving the player without finishing. */
  onExit: () => void;
  /** Tapping Continue on the completion screen. */
  onFinished: () => void;
  onRestart?: () => void;
}) {
  const [attempt, setAttempt] = useState(initial);
  const [shownPosition, setShownPosition] = useState(initial.position);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState<CheckResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [quitOpen, setQuitOpen] = useState(false);
  const [wrongShake, setWrongShake] = useState(0);
  const [praiseText, setPraiseText] = useState(praise[0]!);
  const inFlight = useRef(false);

  const exerciseId = attempt.queue[shownPosition];
  const exercise = exerciseId ? getExercise(exerciseId) : undefined;
  const isRepeat = shownPosition >= attempt.totalExercises;
  const isPractice = attempt.kind === 'practice';
  const finished = attempt.summary !== null;

  const outOfHearts =
    !isPractice && attempt.hearts !== null && attempt.hearts <= 0 && !feedback && !finished;

  useEffect(() => {
    const speech = initial.queue
      .map((id) => {
        const item = getExercise(id);
        return item ? exerciseSpeech(item) : null;
      })
      .filter((text): text is string => Boolean(text));
    void preloadSpeech(speech);
  }, [initial.queue]);

  const check = useCallback(
    async (value: Answer | null) => {
      if (!value || !exercise || inFlight.current || feedback) return;
      inFlight.current = true;
      setChecking(true);
      try {
        const result = await submit({
          attemptId: attempt.id,
          position: shownPosition,
          exerciseId: exercise.id,
          answer: value
        });
        setAttempt(result.attempt);
        if (result.status !== 'ok') {
          // The server knows better: another tab moved on, or hearts ran out.
          setShownPosition(result.attempt.position);
          setAnswer(null);
          setShowHint(false);
          return;
        }
        setFeedback(result);
        if (result.correct) {
          setPraiseText(praise[Math.floor(Math.random() * praise.length)]!);
          playSound('correct');
          const speech = exerciseSpeech(exercise);
          if (speech && isSoundEnabled()) {
            window.setTimeout(() => void playSpeech(speech), 380);
          }
        } else {
          playSound('wrong');
          if (!isPractice) window.setTimeout(() => playSound('heart'), 220);
          setWrongShake((count) => count + 1);
        }
      } catch {
        toast.error('We couldn’t check that answer. Please try again.');
      } finally {
        inFlight.current = false;
        setChecking(false);
      }
    },
    [attempt.id, exercise, feedback, isPractice, shownPosition, submit]
  );

  const advance = useCallback(() => {
    setFeedback(null);
    setAnswer(null);
    setShowHint(false);
    setShownPosition(attempt.position);
  }, [attempt.position]);

  // Enter checks and continues, unless a button already has focus.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || quitOpen) return;
      if ((event.target as HTMLElement | null)?.tagName === 'BUTTON') return;
      if (feedback) advance();
      else void check(answer);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance, answer, check, feedback, quitOpen]);

  if (finished && !feedback) {
    return (
      <CompletionScreen
        summary={attempt.summary!}
        isGuest={isGuest}
        onContinue={onFinished}
      />
    );
  }

  if (outOfHearts) {
    return (
      <OutOfHearts
        nextHeartAt={attempt.nextHeartAt}
        isGuest={isGuest}
        onRestart={onRestart}
        onWaited={() =>
          setAttempt((current) => ({ ...current, hearts: 1, nextHeartAt: null }))
        }
      />
    );
  }

  if (!exercise) {
    return (
      <div className='grid min-h-dvh place-items-center p-6 text-center'>
        <div className='space-y-4'>
          <p className='font-bold'>This exercise is no longer available.</p>
          <GameButton onClick={onExit}>Back</GameButton>
        </div>
      </div>
    );
  }

  const progress = solved(
    attempt,
    feedback ? attempt.position : shownPosition
  );

  return (
    <div className='flex min-h-dvh flex-col bg-card' data-lesson-player>
      <header className='sticky top-0 z-10 bg-card'>
        <div className='mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-4'>
          <button
            type='button'
            aria-label='Quit lesson'
            data-testid='quit'
            onClick={() => setQuitOpen(true)}
            className='cursor-pointer rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground'
          >
            <X className='size-7' strokeWidth={3} />
          </button>
          <ProgressBar
            tone='success'
            value={progress}
            max={attempt.totalExercises}
            label='Lesson progress'
          />
          {attempt.hearts !== null && !isPractice ? (
            <div
              className='flex shrink-0 items-center gap-1 font-black text-brand-heart'
              aria-label={`${attempt.hearts} hearts left`}
              data-hearts={attempt.hearts}
            >
              <HeartIcon
                key={attempt.hearts}
                className='animate-heart-pop size-7'
                empty={attempt.hearts === 0}
              />
              {attempt.hearts}
            </div>
          ) : null}
        </div>
      </header>

      <main className='mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 pt-2 pb-8'>
        {isRepeat ? (
          <p className='mb-3 flex items-center gap-2 text-sm font-black tracking-wide text-brand-accent-dark uppercase'>
            <RotateCcw className='size-4' /> Previous mistake
          </p>
        ) : null}
        <div
          key={`${exercise.id}-${shownPosition}`}
          className='animate-rise-in'
          data-exercise-type={exercise.type}
          data-exercise-id={exercise.id}
        >
          <ExerciseView
            exercise={exercise}
            onAnswer={setAnswer}
            onSubmit={(value) => void check(value)}
            locked={checking || feedback !== null}
          />
        </div>
        <p
          data-testid='voice-disclosure'
          className='mt-6 text-center text-xs font-semibold text-muted-foreground'
        >
          {game.voiceDisclosure}
        </p>
      </main>

      <footer className='sticky bottom-0 z-10'>
        {feedback ? (
          <div
            data-feedback={feedback.correct ? 'correct' : 'wrong'}
            className={cn(
              'animate-sheet-up px-5 pt-4 pb-5',
              feedback.correct
                ? 'bg-brand-success-soft text-brand-success-dark'
                : 'bg-brand-danger-soft text-brand-danger-dark'
            )}
          >
            <div
              key={wrongShake}
              className={cn(
                'mx-auto flex w-full max-w-2xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
                !feedback.correct && 'animate-shake'
              )}
            >
              <div className='flex min-w-0 items-start gap-3'>
                <span
                  className={cn(
                    'hidden size-14 shrink-0 place-items-center rounded-full bg-card sm:grid',
                    feedback.correct ? 'text-brand-success' : 'text-brand-danger'
                  )}
                >
                  {feedback.correct ? (
                    <Check className='size-9' strokeWidth={4} />
                  ) : (
                    <X className='size-9' strokeWidth={4} />
                  )}
                </span>
                <div className='min-w-0'>
                  <h2 className='text-xl font-black'>
                    {!feedback.correct
                      ? 'Not quite'
                      : feedback.accentFix
                        ? 'Correct! Watch the accents'
                        : praiseText}
                  </h2>
                  <FeedbackAnswer exercise={exercise} feedback={feedback} />
                  {!feedback.correct ? (
                    <p className='mt-1 text-sm font-bold opacity-80'>
                      This one will come back at the end of the lesson.
                    </p>
                  ) : null}
                </div>
              </div>
              <GameButton
                autoFocus
                size='lg'
                variant={feedback.correct ? 'success' : 'danger'}
                className='w-full sm:w-auto sm:min-w-40'
                data-testid='continue'
                onClick={advance}
              >
                Continue
              </GameButton>
            </div>
          </div>
        ) : (
          <div className='border-t-2 border-border bg-card px-5 py-4'>
            {showHint ? (
              <div
                data-hint
                className='animate-rise-in mx-auto mb-3 flex w-full max-w-2xl items-start gap-3 rounded-2xl bg-brand-accent-soft p-3 font-bold text-brand-accent-ink'
              >
                <Lightbulb className='mt-0.5 size-5 shrink-0' />
                <p>{exercise.hint}</p>
              </div>
            ) : null}
            <div className='mx-auto flex w-full max-w-2xl items-center justify-between gap-3'>
              <GameButton
                variant='outline'
                size='lg'
                data-testid='hint'
                aria-expanded={showHint}
                onClick={() => setShowHint((value) => !value)}
              >
                <Lightbulb className='size-5' />
                Hint
              </GameButton>
              <GameButton
                size='lg'
                className='flex-1 sm:max-w-56'
                data-testid='check'
                disabled={!answer || checking}
                onClick={() => void check(answer)}
              >
                {checking ? 'Checking…' : 'Check'}
              </GameButton>
            </div>
          </div>
        )}
      </footer>

      <Dialog open={quitOpen} onOpenChange={setQuitOpen}>
        <DialogContent
          showCloseButton={false}
          className='max-w-sm rounded-3xl p-6 text-center'
          data-quit-dialog
        >
          <Mascot pose='sad' className='mx-auto size-28' />
          <DialogTitle className='text-2xl font-black'>
            Wait, don’t go!
          </DialogTitle>
          <DialogDescription className='font-semibold'>
            {isPractice
              ? `${brand.mascot.name} will hold your place, but you only earn your heart back when you finish.`
              : `${brand.mascot.name} will hold your place, but you only earn XP when you finish the lesson.`}
          </DialogDescription>
          <div className='mt-2 flex flex-col gap-3'>
            <GameButton
              size='lg'
              data-testid='keep-learning'
              onClick={() => setQuitOpen(false)}
            >
              Keep learning
            </GameButton>
            <GameButton
              variant='ghost'
              className='text-brand-danger hover:bg-brand-danger-soft'
              data-testid='confirm-quit'
              onClick={onExit}
            >
              Quit
            </GameButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
