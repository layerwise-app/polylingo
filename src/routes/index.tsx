import { createFileRoute, Link } from '@tanstack/react-router';
import { Headphones, Puzzle, Repeat2, Type } from 'lucide-react';
import { Art } from '~/components/art/Art';
import { Logo, Mascot } from '~/components/brand/Mascot';
import { GameButton } from '~/components/game/GameButton';
import { FlameIcon, HeartIcon, XpIcon } from '~/components/game/icons';
import { ProgressBar } from '~/components/game/ProgressBar';
import { brand } from '~/brand.config';
import { game } from '~/config/game';
import { getLesson, freeLessonId, lessons } from '~/content/course';
import { getAuthSession } from '~/lib/auth.functions';
import { siteUrl } from '~/lib/site';
import { seo } from '~/utils/seo';

const freeLesson = getLesson(freeLessonId)!;

export const Route = createFileRoute('/')({
  head: () =>
    seo({
      title: `${brand.name}: Learn ${brand.language} in tiny daily lessons`,
      description: brand.description,
      path: '/',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: brand.name,
        url: siteUrl('/')
      }
    }),
  loader: async () => ({ signedIn: Boolean(await getAuthSession()) }),
  component: Home
});

function PrimaryCta({ signedIn }: { signedIn: boolean }) {
  return (
    <GameButton asChild size='lg' className='w-full sm:w-auto'>
      {signedIn ? (
        <Link to='/dashboard'>Continue learning</Link>
      ) : (
        <Link to='/try' data-testid='try-free'>
          Try a free lesson
        </Link>
      )}
    </GameButton>
  );
}

function LessonMock() {
  return (
    <div
      aria-hidden
      className='w-full max-w-sm rounded-[2rem] border-2 border-border bg-card p-5'
      style={{ boxShadow: '0 8px 0 var(--brand-border)' }}
    >
      <div className='mb-4 flex items-center gap-3'>
        <ProgressBar tone='success' value={6} max={10} label='' />
        <span className='flex items-center gap-1 font-black text-brand-heart'>
          <HeartIcon className='size-6' />5
        </span>
      </div>
      <p className='mb-3 text-lg font-black'>Which one means “the apple”?</p>
      <div className='grid grid-cols-2 gap-3'>
        {[
          { art: 'bread', label: 'el pan' },
          { art: 'apple', label: 'la manzana', selected: true },
          { art: 'cheese', label: 'el queso' },
          { art: 'egg', label: 'el huevo' }
        ].map((option) => (
          <div
            key={option.art}
            className={
              option.selected
                ? 'press-3d flex flex-col items-center gap-1 rounded-2xl border-2 border-brand-success bg-brand-success-soft p-3 font-bold text-brand-success-dark [--lip:var(--brand-success)]'
                : 'press-3d flex flex-col items-center gap-1 rounded-2xl border-2 border-border p-3 font-bold'
            }
          >
            <Art name={option.art} className='size-16' />
            {option.label}
          </div>
        ))}
      </div>
      <div className='mt-4 rounded-2xl bg-brand-success-soft p-3 font-black text-brand-success-dark'>
        ¡Muy bien! Manzana means apple.
      </div>
    </div>
  );
}

const exerciseKinds = [
  {
    icon: Puzzle,
    title: 'Build sentences',
    text: 'Tap words from a word bank to say real things, like “Quiero agua, por favor.”'
  },
  {
    icon: Headphones,
    title: 'Listen and type',
    text: 'Hear every sentence spoken in Spanish, then slow it down with one tap.'
  },
  {
    icon: Type,
    title: 'Forgiving spelling',
    text: 'No ñ on your keyboard? You’ll still get credit, and see the correct spelling.'
  },
  {
    icon: Repeat2,
    title: 'Mistakes come back',
    text: 'Anything you miss returns at the end of the lesson, until it sticks.'
  }
];

function Home() {
  const { signedIn } = Route.useLoaderData();

  return (
    <div className='min-h-dvh bg-card'>
      <header className='sticky top-0 z-20 border-b-2 border-border bg-card/95 backdrop-blur'>
        <div className='mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6'>
          <Link to='/' aria-label={`${brand.name} home`}>
            <Logo />
          </Link>
          {signedIn ? (
            <GameButton asChild variant='outline' size='sm'>
              <Link to='/dashboard'>Go to my path</Link>
            </GameButton>
          ) : (
            <GameButton asChild variant='outline' size='sm'>
              <Link to='/sign-in'>Sign in</Link>
            </GameButton>
          )}
        </div>
      </header>

      <main>
        <section className='mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-20'>
          <div className='flex flex-col items-center text-center lg:items-start lg:text-left'>
            <div className='mb-4 flex items-end gap-5'>
              <Mascot pose='wave' animate='bob' className='size-28 sm:size-32' />
              <p className='relative mb-8 rounded-2xl border-2 border-border bg-card px-4 py-2 font-black'>
                ¡Hola! Soy {brand.mascot.name}.
              </p>
            </div>
            <h1 className='text-4xl font-black tracking-tight text-balance sm:text-5xl lg:text-6xl'>
              {brand.tagline}
            </h1>
            <p className='mt-4 max-w-xl text-lg font-semibold text-balance text-muted-foreground sm:text-xl'>
              Short lessons, spoken audio, and a parrot who celebrates every
              win. Start speaking beginner {brand.language} in five minutes a
              day.
            </p>
            <div className='mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row'>
              <PrimaryCta signedIn={signedIn} />
              {signedIn ? null : (
                <GameButton asChild variant='outline' size='lg'>
                  <Link to='/sign-up'>Create free account</Link>
                </GameButton>
              )}
            </div>
            {signedIn ? null : (
              <p className='mt-3 text-sm font-bold text-muted-foreground'>
                No account needed for your first lesson. Your progress comes
                with you when you sign up.
              </p>
            )}
          </div>
          <div className='flex justify-center lg:justify-end'>
            <LessonMock />
          </div>
        </section>

        <section className='bg-background px-4 py-14 sm:px-6'>
          <div className='mx-auto max-w-6xl'>
            <h2 className='text-center text-3xl font-black tracking-tight sm:text-4xl'>
              One path. {lessons.length} lessons. Real {brand.language}.
            </h2>
            <p className='mx-auto mt-2 max-w-2xl text-center text-lg font-semibold text-muted-foreground'>
              Everything you’d want on your first trip, in the order you’ll need
              it.
            </p>
            <ol className='mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5'>
              {lessons.map((lesson, index) => (
                <li
                  key={lesson.id}
                  className='press-3d flex flex-col items-center gap-2 rounded-3xl border-2 border-border bg-card p-4 text-center'
                >
                  <Art name={lesson.art} className='size-16' />
                  <span className='text-xs font-black tracking-wide text-muted-foreground uppercase'>
                    Lesson {index + 1}
                  </span>
                  <span className='leading-tight font-black'>
                    {lesson.title}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className='mx-auto max-w-6xl px-4 py-14 sm:px-6'>
          <h2 className='text-center text-3xl font-black tracking-tight sm:text-4xl'>
            Lessons that feel like a game
          </h2>
          <div className='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {exerciseKinds.map((kind) => (
              <article
                key={kind.title}
                className='rounded-3xl border-2 border-border p-5'
              >
                <span className='grid size-12 place-items-center rounded-2xl bg-brand-primary-soft text-brand-primary'>
                  <kind.icon className='size-7' strokeWidth={2.5} />
                </span>
                <h3 className='mt-3 text-lg font-black'>{kind.title}</h3>
                <p className='mt-1 font-semibold text-muted-foreground'>
                  {kind.text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className='bg-brand-accent-soft px-4 py-14 sm:px-6'>
          <div className='mx-auto grid max-w-6xl gap-8 lg:grid-cols-2 lg:items-center'>
            <div>
              <h2 className='text-3xl font-black tracking-tight sm:text-4xl'>
                Reasons to come back tomorrow
              </h2>
              <ul className='mt-6 space-y-4'>
                <li className='flex gap-3'>
                  <FlameIcon className='size-8 shrink-0' />
                  <p className='font-semibold'>
                    <strong className='font-black'>Daily streaks.</strong> Learn
                    once a day and watch your flame grow.
                  </p>
                </li>
                <li className='flex gap-3'>
                  <XpIcon className='size-8 shrink-0' />
                  <p className='font-semibold'>
                    <strong className='font-black'>XP and daily goals.</strong>{' '}
                    Pick a pace from {game.dailyGoalOptions[0].xp} to{' '}
                    {game.dailyGoalOptions.at(-1)!.xp} XP a day, then climb the
                    weekly leaderboard.
                  </p>
                </li>
                <li className='flex gap-3'>
                  <HeartIcon className='size-8 shrink-0' />
                  <p className='font-semibold'>
                    <strong className='font-black'>
                      {game.hearts.max} hearts.
                    </strong>{' '}
                    Mistakes cost a heart. They refill over time, or you can
                    earn them back by practicing what you missed.
                  </p>
                </li>
              </ul>
            </div>
            <div className='flex justify-center'>
              <Mascot pose='cheer' animate='celebrate' className='size-56' />
            </div>
          </div>
        </section>

        <section className='px-4 py-16 text-center sm:px-6'>
          <h2 className='text-3xl font-black tracking-tight text-balance sm:text-4xl'>
            Your first {brand.language} words are five minutes away
          </h2>
          <p className='mx-auto mt-2 max-w-xl text-lg font-semibold text-muted-foreground'>
            Start with {freeLesson.title}. {brand.mascot.description}
          </p>
          <div className='mt-6 flex justify-center'>
            <PrimaryCta signedIn={signedIn} />
          </div>
        </section>
      </main>

      <footer className='border-t-2 border-border px-4 py-8 sm:px-6'>
        <div className='mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row'>
          <Logo className='text-xl' />
          <nav aria-label='Footer' className='flex flex-wrap justify-center gap-5 text-sm font-extrabold text-muted-foreground'>
            <Link to='/try'>Free lesson</Link>
            <Link to='/sign-in'>Sign in</Link>
            <Link to='/sign-up'>Sign up</Link>
            <a href={`mailto:${brand.supportEmail}`}>Contact</a>
          </nav>
          <p className='text-sm font-semibold text-muted-foreground'>
            © {new Date().getFullYear()} {brand.name}
          </p>
        </div>
        <p
          data-testid='voice-disclosure'
          className='mx-auto mt-4 max-w-6xl text-center text-xs font-semibold text-muted-foreground'
        >
          {game.voiceDisclosure}
        </p>
      </footer>
    </div>
  );
}
