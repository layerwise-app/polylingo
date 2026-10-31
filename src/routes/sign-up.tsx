import { useEffect, useState } from 'react';
import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { AuthField, AuthLayout, authInputClass } from '~/components/brand/AuthLayout';
import { GameButton } from '~/components/game/GameButton';
import { Input } from '~/components/ui/input';
import { brand } from '~/brand.config';
import { authClient } from '~/lib/auth-client';
import { getAuthSession } from '~/lib/auth.functions';
import { peekGuestToken } from '~/lib/guest';
import { seo } from '~/utils/seo';

export const Route = createFileRoute('/sign-up')({
  beforeLoad: async () => {
    if (await getAuthSession()) throw redirect({ to: '/dashboard' });
  },
  head: () => seo({ title: `Create an account | ${brand.name}`, noindex: true }),
  component: SignUpPage
});

function SignUpPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hasGuestLesson, setHasGuestLesson] = useState(false);
  const passwordsMatch = password === confirmPassword;

  useEffect(() => {
    setHasGuestLesson(peekGuestToken() !== null);
  }, []);

  const signUp = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.signUp.email({
        name,
        email,
        password
      });
      if (error) throw new Error(error.message ?? 'Failed to create account');
    },
    onSuccess: () => navigate({ to: '/dashboard' })
  });

  return (
    <AuthLayout
      pose='cheer'
      title='Create your account'
      description={
        hasGuestLesson
          ? 'Your free lesson comes with you. Sign up to keep your XP and streak.'
          : `${brand.mascot.name} can’t wait to learn with you.`
      }
    >
      <form
        className='flex flex-col gap-4'
        onSubmit={(event) => {
          event.preventDefault();
          if (!passwordsMatch) return;
          signUp.mutate();
        }}
      >
        <AuthField id='name' label='Name'>
          <Input
            id='name'
            className={authInputClass}
            autoComplete='name'
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </AuthField>
        <AuthField id='email' label='Email'>
          <Input
            id='email'
            type='email'
            className={authInputClass}
            autoComplete='email'
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </AuthField>
        <AuthField id='password' label='Password'>
          <Input
            id='password'
            type='password'
            className={authInputClass}
            autoComplete='new-password'
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </AuthField>
        <AuthField id='confirm-password' label='Confirm password'>
          <Input
            id='confirm-password'
            type='password'
            className={authInputClass}
            autoComplete='new-password'
            minLength={8}
            required
            aria-invalid={confirmPassword ? !passwordsMatch : undefined}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
          {confirmPassword && !passwordsMatch ? (
            <p className='text-sm font-bold text-destructive'>
              Passwords do not match.
            </p>
          ) : null}
        </AuthField>
        {signUp.error ? (
          <p className='text-sm font-bold text-destructive'>{signUp.error.message}</p>
        ) : null}
        <GameButton
          type='submit'
          size='lg'
          data-testid='create-account'
          disabled={!passwordsMatch || signUp.isPending}
        >
          {signUp.isPending ? 'Creating account…' : 'Create account'}
        </GameButton>
        <p className='text-center text-sm font-semibold text-muted-foreground'>
          Already have an account?{' '}
          <Link to='/sign-in' className='font-extrabold text-brand-primary'>
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
