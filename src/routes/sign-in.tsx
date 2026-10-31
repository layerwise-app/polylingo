import { useState } from 'react';
import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { ChevronDownIcon } from 'lucide-react';
import { AuthField, AuthLayout, authInputClass } from '~/components/brand/AuthLayout';
import { GameButton } from '~/components/game/GameButton';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '~/components/ui/collapsible';
import { Input } from '~/components/ui/input';
import { Separator } from '~/components/ui/separator';
import { brand } from '~/brand.config';
import { authClient } from '~/lib/auth-client';
import { getAuthSession } from '~/lib/auth.functions';
import { seo } from '~/utils/seo';

export const Route = createFileRoute('/sign-in')({
  beforeLoad: async () => {
    if (await getAuthSession()) throw redirect({ to: '/dashboard' });
  },
  head: () => seo({ title: `Sign in | ${brand.name}`, noindex: true }),
  component: SignInPage
});

function SignInPage() {
  const navigate = useNavigate();
  const [passwordEmail, setPasswordEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpEmail, setOtpEmail] = useState('');

  const sendOtp = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: otpEmail,
        type: 'sign-in'
      });
      if (error) throw new Error(error.message ?? 'Failed to send code');
    },
    onSuccess: () =>
      navigate({ to: '/sign-in/otp', search: { email: otpEmail } })
  });

  const signInWithPassword = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.signIn.email({
        email: passwordEmail,
        password
      });
      if (error) throw new Error(error.message ?? 'Failed to sign in');
    },
    onSuccess: () => navigate({ to: '/dashboard' })
  });

  return (
    <AuthLayout
      title='Welcome back!'
      description={`${brand.mascot.name} saved your spot. Enter your email and we’ll send you a one-time code.`}
    >
      <div className='flex flex-col gap-5'>
        <form
          className='flex flex-col gap-4'
          onSubmit={(event) => {
            event.preventDefault();
            sendOtp.mutate();
          }}
        >
          <AuthField id='otp-email' label='Email'>
            <Input
              id='otp-email'
              type='email'
              className={authInputClass}
              autoComplete='email'
              autoFocus
              required
              value={otpEmail}
              onChange={(event) => {
                setOtpEmail(event.target.value);
                sendOtp.reset();
              }}
            />
          </AuthField>
          {sendOtp.error ? (
            <p className='text-sm font-bold text-destructive'>
              {sendOtp.error.message}
            </p>
          ) : null}
          <GameButton type='submit' size='lg' disabled={sendOtp.isPending}>
            {sendOtp.isPending ? 'Sending code…' : 'Continue with email'}
          </GameButton>
        </form>
        <div className='flex items-center gap-3'>
          <Separator className='flex-1' />
          <span className='text-xs font-black text-muted-foreground'>OR</span>
          <Separator className='flex-1' />
        </div>
        <Collapsible>
          <CollapsibleTrigger asChild>
            <GameButton variant='ghost' className='group w-full' data-testid='password-toggle'>
              Sign in with password
              <ChevronDownIcon className='size-4 transition-transform group-data-[state=open]:rotate-180' />
            </GameButton>
          </CollapsibleTrigger>
          <CollapsibleContent className='pt-4'>
            <form
              className='flex flex-col gap-4'
              onSubmit={(event) => {
                event.preventDefault();
                signInWithPassword.mutate();
              }}
            >
              <AuthField id='password-email' label='Email'>
                <Input
                  id='password-email'
                  type='email'
                  className={authInputClass}
                  autoComplete='email'
                  required
                  value={passwordEmail}
                  onChange={(event) => {
                    setPasswordEmail(event.target.value);
                    signInWithPassword.reset();
                  }}
                />
              </AuthField>
              <AuthField
                id='password'
                label='Password'
                action={
                  <Link
                    to='/forgot-password'
                    className='text-sm font-bold text-brand-primary'
                  >
                    Forgot password?
                  </Link>
                }
              >
                <Input
                  id='password'
                  type='password'
                  className={authInputClass}
                  autoComplete='current-password'
                  required
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    signInWithPassword.reset();
                  }}
                />
              </AuthField>
              {signInWithPassword.error ? (
                <p className='text-sm font-bold text-destructive'>
                  {signInWithPassword.error.message}
                </p>
              ) : null}
              <GameButton
                type='submit'
                variant='outline'
                size='lg'
                disabled={signInWithPassword.isPending}
              >
                {signInWithPassword.isPending
                  ? 'Signing in…'
                  : 'Sign in with password'}
              </GameButton>
            </form>
          </CollapsibleContent>
        </Collapsible>
        <p className='text-center text-sm font-semibold text-muted-foreground'>
          Don’t have an account?{' '}
          <Link to='/sign-up' className='font-extrabold text-brand-primary'>
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
