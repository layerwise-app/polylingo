import { useState } from 'react';
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate
} from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { AuthLayout } from '~/components/brand/AuthLayout';
import { GameButton } from '~/components/game/GameButton';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from '~/components/ui/input-otp';
import { brand } from '~/brand.config';
import { authClient } from '~/lib/auth-client';
import { seo } from '~/utils/seo';

export const Route = createFileRoute('/sign-in_/otp')({
  validateSearch: (search: Record<string, unknown>) => ({
    email: typeof search.email === 'string' ? search.email.trim() : ''
  }),
  beforeLoad: ({ search }) => {
    if (!search.email) throw redirect({ to: '/sign-in' });
  },
  head: () => seo({ title: `Check your email | ${brand.name}`, noindex: true }),
  component: EmailOtpPage
});

function EmailOtpPage() {
  const navigate = useNavigate();
  const { email } = Route.useSearch();
  const [otp, setOtp] = useState('');

  const verifyOtp = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.signIn.emailOtp({ email, otp });
      if (error) throw new Error(error.message ?? 'Invalid code');
    },
    onSuccess: () => navigate({ to: '/dashboard' })
  });

  const resendOtp = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'sign-in'
      });
      if (error) throw new Error(error.message ?? 'Failed to resend code');
    }
  });

  return (
    <AuthLayout
      pose='think'
      title='Check your email'
      description={`Enter the six-digit code we sent to ${email}.`}
    >
      <div className='flex flex-col gap-5'>
        <form
          className='flex flex-col gap-4'
          onSubmit={(event) => {
            event.preventDefault();
            verifyOtp.mutate();
          }}
        >
          <InputOTP
            autoFocus
            autoComplete='one-time-code'
            containerClassName='w-full'
            maxLength={6}
            value={otp}
            onChange={(value) => {
              setOtp(value);
              verifyOtp.reset();
            }}
          >
            <InputOTPGroup className='w-full'>
              {Array.from({ length: 6 }, (_, index) => (
                <InputOTPSlot
                  key={index}
                  index={index}
                  className='h-14 flex-1 text-lg font-black'
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
          {verifyOtp.error ? (
            <p className='text-sm font-bold text-destructive'>
              {verifyOtp.error.message}
            </p>
          ) : null}
          <GameButton
            type='submit'
            size='lg'
            disabled={otp.length < 6 || verifyOtp.isPending}
          >
            {verifyOtp.isPending ? 'Verifying…' : 'Verify and sign in'}
          </GameButton>
        </form>
        <div className='flex flex-col items-center gap-2 text-sm font-bold'>
          <button
            type='button'
            className='cursor-pointer text-brand-primary disabled:opacity-60'
            disabled={resendOtp.isPending}
            onClick={() => resendOtp.mutate()}
          >
            {resendOtp.isPending
              ? 'Sending…'
              : resendOtp.isSuccess
                ? 'Code sent'
                : 'Resend code'}
          </button>
          {resendOtp.error ? (
            <p className='text-center text-sm text-destructive'>
              {resendOtp.error.message}
            </p>
          ) : null}
          <Link to='/sign-in' className='text-muted-foreground'>
            Use a different email
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
