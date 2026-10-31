import { Link, useRouterState } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Dumbbell, House, Settings, Trophy, UserRound } from 'lucide-react';
import { Logo } from '~/components/brand/Mascot';
import { RightRail, StatsRow } from '~/components/game/RightRail';
import { learnerStateQuery } from '~/lib/game.queries';
import { cn } from '~/lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Learn', icon: House, exact: true, mobile: true },
  { to: '/dashboard/practice', label: 'Practice', icon: Dumbbell, exact: false, mobile: true },
  { to: '/dashboard/leaderboard', label: 'Leaderboard', icon: Trophy, exact: false, mobile: true },
  { to: '/dashboard/profile', label: 'Profile', icon: UserRound, exact: false, mobile: true },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings, exact: false, mobile: false }
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { data: state } = useSuspenseQuery(learnerStateQuery);

  const isActive = (item: (typeof navItems)[number]) =>
    item.exact
      ? pathname === item.to || pathname === `${item.to}/`
      : pathname.startsWith(item.to);

  return (
    <div className='min-h-dvh bg-card'>
      {/* Desktop sidebar */}
      <aside className='fixed inset-y-0 left-0 z-20 hidden w-64 flex-col gap-6 border-r-2 border-border bg-card px-4 py-6 lg:flex'>
        <Link to='/dashboard' className='px-3'>
          <Logo />
        </Link>
        <nav aria-label='Main' className='flex flex-col gap-1.5'>
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              data-nav={item.label}
              aria-current={isActive(item) ? 'page' : undefined}
              className={cn(
                'flex items-center gap-4 rounded-2xl border-2 border-transparent px-4 py-3 text-sm font-black tracking-wide uppercase transition-colors',
                isActive(item)
                  ? 'border-brand-primary bg-brand-primary-soft text-brand-primary'
                  : 'text-muted-foreground hover:bg-background'
              )}
            >
              <item.icon className='size-6' strokeWidth={2.5} />
              {item.label}
              {item.label === 'Practice' && state.mistakesCount > 0 ? (
                <span className='ml-auto grid size-6 place-items-center rounded-full bg-brand-danger text-xs text-white'>
                  {Math.min(state.mistakesCount, 9)}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile top bar */}
      <header className='sticky top-0 z-20 flex items-center justify-between gap-3 border-b-2 border-border bg-card px-4 py-2.5 lg:hidden'>
        <Link to='/dashboard' aria-label='Home'>
          <Logo showName={false} />
        </Link>
        <StatsRow state={state} />
      </header>

      <div className='lg:pl-64'>
        <div className='mx-auto flex w-full max-w-5xl justify-center gap-10 px-4 pt-5 pb-28 sm:px-6 lg:pb-12'>
          <main className='w-full max-w-xl min-w-0'>{children}</main>
          <RightRail state={state} />
        </div>
      </div>

      {/* Mobile tab bar */}
      <nav
        aria-label='Main'
        className='fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t-2 border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden'
      >
        {navItems
          .filter((item) => item.mobile)
          .map((item) => (
            <Link
              key={item.to}
              to={item.to}
              data-tab={item.label}
              aria-current={isActive(item) ? 'page' : undefined}
              className={cn(
                'relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-black tracking-wide uppercase',
                isActive(item) ? 'text-brand-primary' : 'text-muted-foreground'
              )}
            >
              <span
                className={cn(
                  'grid h-8 w-12 place-items-center rounded-xl transition-all',
                  isActive(item) && 'bg-brand-primary-soft'
                )}
              >
                <item.icon className='size-6' strokeWidth={2.5} />
              </span>
              {item.label}
            </Link>
          ))}
      </nav>
    </div>
  );
}
