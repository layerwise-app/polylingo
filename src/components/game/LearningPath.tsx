import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Check, Lock, Star } from 'lucide-react';
import { Art } from '~/components/art/Art';
import { Mascot } from '~/components/brand/Mascot';
import { GameButton } from '~/components/game/GameButton';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '~/components/ui/popover';
import { brand } from '~/brand.config';
import { game } from '~/config/game';
import { lessons } from '~/content/course';
import type { Lesson } from '~/content/types';
import type { LearnerState } from '~/lib/game-types';
import { cn } from '~/lib/utils';

type NodeState = 'completed' | 'current' | 'locked';

const nodeSize = 84;
const rowHeight = 168;
const pathWidth = 320;
// One swing of the winding path. Lessons follow it from the top down.
const swing = [0, 58, 92, 58, 0, -58, -92, -58];

function nodePosition(index: number) {
  return {
    x: pathWidth / 2 + swing[index % swing.length]!,
    y: rowHeight * index + nodeSize / 2 + 44
  };
}

function ProgressRing({ progress }: { progress: number }) {
  const radius = nodeSize / 2 + 8;
  const circumference = 2 * Math.PI * radius;
  return (
    <svg
      aria-hidden
      className='pointer-events-none absolute -inset-3 -rotate-90'
      style={{ width: nodeSize + 24, height: nodeSize + 24 }}
    >
      <circle
        cx={nodeSize / 2 + 12}
        cy={nodeSize / 2 + 12}
        r={radius}
        fill='none'
        stroke='var(--brand-border)'
        strokeWidth='8'
      />
      <circle
        cx={nodeSize / 2 + 12}
        cy={nodeSize / 2 + 12}
        r={radius}
        fill='none'
        stroke='var(--brand-accent)'
        strokeWidth='8'
        strokeLinecap='round'
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - progress)}
      />
    </svg>
  );
}

function LessonNode({
  lesson,
  index,
  state,
  progress,
  previousTitle,
  isReturning
}: {
  lesson: Lesson;
  index: number;
  state: NodeState;
  progress: number;
  previousTitle: string | null;
  isReturning: boolean;
}) {
  const [open, setOpen] = useState(false);
  const position = nodePosition(index);
  const inProgress = progress > 0 && state !== 'locked';

  return (
    <div
      className='absolute flex flex-col items-center'
      style={{
        left: position.x,
        top: position.y - nodeSize / 2,
        width: nodeSize,
        marginLeft: -nodeSize / 2
      }}
      data-lesson-node={lesson.id}
      data-state={state}
    >
      {state === 'current' && !open ? (
        <span className='animate-float-tip absolute -top-11 left-1/2 z-10 rounded-xl border-2 border-border bg-card px-3 py-1.5 text-sm font-black tracking-wide whitespace-nowrap text-brand-primary uppercase shadow-sm'>
          {inProgress ? 'Continue' : isReturning ? 'Next' : 'Start'}
          <span className='absolute top-full left-1/2 -mt-1 size-2.5 -translate-x-1/2 rotate-45 border-r-2 border-b-2 border-border bg-card' />
        </span>
      ) : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type='button'
            aria-label={`${lesson.title}: ${state}`}
            className={cn(
              'press-3d relative grid cursor-pointer place-items-center rounded-full outline-none [--lip-height:7px] focus-visible:ring-4 focus-visible:ring-primary/40',
              state === 'completed' &&
                'bg-brand-accent text-brand-accent-ink [--lip:var(--brand-accent-dark)]',
              state === 'current' &&
                'bg-brand-primary text-white [--lip:var(--brand-primary-dark)]',
              state === 'current' && !inProgress && 'node-pulse',
              state === 'locked' &&
                'bg-border text-muted-foreground [--lip:#c3d0dc]'
            )}
            style={{ width: nodeSize, height: nodeSize }}
          >
            {state === 'current' && inProgress ? (
              <ProgressRing progress={progress} />
            ) : null}
            {state === 'completed' ? (
              <Check className='size-10' strokeWidth={4} />
            ) : null}
            {state === 'current' ? (
              <Star className='size-10 fill-current' strokeWidth={2.5} />
            ) : null}
            {state === 'locked' ? (
              <Lock className='size-8' strokeWidth={3} />
            ) : null}
          </button>
        </PopoverTrigger>
        <PopoverContent
          side='bottom'
          sideOffset={14}
          className={cn(
            'w-72 rounded-3xl border-2 p-4',
            state === 'locked' && 'bg-card',
            state === 'current' && 'border-brand-primary',
            state === 'completed' && 'border-brand-accent'
          )}
        >
          <div className='flex items-center gap-3'>
            <Art
              name={lesson.art}
              className={cn(
                'size-14 shrink-0',
                state === 'locked' && 'opacity-50 grayscale'
              )}
            />
            <div className='min-w-0'>
              <p className='text-xs font-black tracking-wide text-muted-foreground uppercase'>
                Lesson {index + 1}
              </p>
              <h3 className='text-lg leading-tight font-black'>
                {lesson.title}
              </h3>
            </div>
          </div>
          <p className='mt-2 text-sm font-semibold text-muted-foreground'>
            {state === 'locked'
              ? `Finish “${previousTitle}” to unlock this lesson.`
              : lesson.description}
          </p>
          {state === 'locked' ? (
            <GameButton disabled className='mt-3 w-full'>
              Locked
            </GameButton>
          ) : (
            <GameButton
              asChild
              variant={state === 'completed' ? 'accent' : 'primary'}
              className='mt-3 w-full'
            >
              <Link
                to='/dashboard/lesson/$lessonId'
                params={{ lessonId: lesson.id }}
                data-start-lesson={lesson.id}
              >
                {state === 'completed'
                  ? `Review +${game.xp.lessonReplay} XP`
                  : `${inProgress ? 'Continue' : 'Start'} +${game.xp.lessonFirstTime} XP`}
              </Link>
            </GameButton>
          )}
        </PopoverContent>
      </Popover>
      <p
        className={cn(
          'relative mt-3 w-max max-w-36 rounded-lg bg-card px-1.5 py-0.5 text-center text-sm leading-tight font-extrabold',
          state === 'locked' ? 'text-muted-foreground' : 'text-foreground'
        )}
      >
        {lesson.title}
      </p>
    </div>
  );
}

export function LearningPath({ state }: { state: LearnerState }) {
  const completed = new Set(state.completedLessonIds);
  const nodeStateOf = (lesson: Lesson): NodeState =>
    completed.has(lesson.id)
      ? 'completed'
      : lesson.id === state.currentLessonId
        ? 'current'
        : 'locked';
  const height = nodePosition(lessons.length - 1).y + nodeSize + 30;
  const currentIndex = lessons.findIndex(
    (lesson) => lesson.id === state.currentLessonId
  );

  return (
    <div className='mx-auto' style={{ maxWidth: pathWidth }}>
      <div className='relative' style={{ height }}>
        <svg
          aria-hidden
          className='absolute inset-0 overflow-visible'
          width={pathWidth}
          height={height}
        >
          {lessons.slice(1).map((lesson, offset) => {
            const start = nodePosition(offset);
            const end = nodePosition(offset + 1);
            const middle = (start.y + end.y) / 2;
            return (
              <path
                key={lesson.id}
                d={`M${start.x} ${start.y} C${start.x} ${middle} ${end.x} ${middle} ${end.x} ${end.y}`}
                fill='none'
                stroke={
                  completed.has(lessons[offset]!.id)
                    ? 'var(--brand-accent)'
                    : 'var(--brand-border)'
                }
                strokeWidth='12'
                strokeLinecap='round'
                strokeDasharray='2 22'
              />
            );
          })}
        </svg>
        {lessons.map((lesson, index) => (
          <LessonNode
            key={lesson.id}
            lesson={lesson}
            index={index}
            state={nodeStateOf(lesson)}
            progress={state.lessonProgress[lesson.id] ?? 0}
            previousTitle={lessons[index - 1]?.title ?? null}
            isReturning={state.completedLessonIds.length > 0}
          />
        ))}
        {currentIndex >= 0 ? (
          <Mascot
            pose={state.completedLessonIds.length === 0 ? 'wave' : 'idle'}
            animate='bob'
            className='absolute size-24'
            // Polly stands on the open side of the current lesson.
            style={{
              top: nodePosition(currentIndex).y - 48,
              left:
                nodePosition(currentIndex).x +
                (nodePosition(currentIndex).x >= pathWidth / 2 ? -150 : 56)
            }}
          />
        ) : null}
      </div>
      <div
        className={cn(
          'mt-2 mb-4 rounded-3xl border-2 p-5 text-center',
          state.courseComplete
            ? 'border-brand-accent bg-brand-accent-soft'
            : 'border-border'
        )}
        data-course-end
      >
        <Art
          name='badge-trophy'
          className={cn('mx-auto size-16', !state.courseComplete && 'opacity-40 grayscale')}
        />
        <h2 className='mt-1 text-xl font-black'>
          {state.courseComplete ? '¡Felicidades! You finished the path' : 'The finish line'}
        </h2>
        <p className='text-sm font-semibold text-muted-foreground'>
          {state.courseComplete
            ? `${brand.mascot.name} is thrilled. Replay any lesson or keep your streak going in practice.`
            : `Finish all ${lessons.length} lessons to become a Course Champion.`}
        </p>
      </div>
    </div>
  );
}
