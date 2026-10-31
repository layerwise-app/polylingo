import { Link } from '@tanstack/react-router';
import { Logo, Mascot } from '~/components/brand/Mascot';
import { Label } from '~/components/ui/label';
import type { MascotPose } from '~/brand.config';

export const authInputClass =
  'h-12 rounded-2xl border-2 border-border bg-background px-4 text-base font-semibold shadow-none focus-visible:border-brand-primary focus-visible:ring-0';

export function AuthField({
  id,
  label,
  action,
  children
}: {
  id: string;
  label: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className='flex flex-col gap-1.5'>
      <div className='flex items-center justify-between gap-4'>
        <Label htmlFor={id} className='font-extrabold'>
          {label}
        </Label>
        {action}
      </div>
      {children}
    </div>
  );
}

export function AuthLayout({
  title,
  description,
  pose = 'wave',
  children
}: {
  title: string;
  description: React.ReactNode;
  pose?: MascotPose;
  children: React.ReactNode;
}) {
  return (
    <div className='flex min-h-dvh flex-col items-center bg-background px-4 py-6'>
      <Link to='/' className='mb-4'>
        <Logo />
      </Link>
      <div className='flex w-full flex-1 flex-col items-center justify-center'>
        <div className='relative w-full max-w-md'>
          <Mascot
            pose={pose}
            animate='bob'
            className='relative z-10 mx-auto -mb-5 size-28'
          />
          <main
            className='rounded-3xl border-2 border-border bg-card p-6 sm:p-8'
            style={{ boxShadow: '0 5px 0 var(--brand-border)' }}
          >
            <h1 className='text-center text-2xl font-black tracking-tight'>
              {title}
            </h1>
            <p className='mt-1 mb-5 text-center font-semibold text-muted-foreground'>
              {description}
            </p>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
