import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/feedback';
import { toMessage } from '@/lib/error-message';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/auth-store';

const loginSchema = z.object({
  email: z.email('Enter a valid email address.'),
  // Only a length rule: the server owns the credential check, and a stricter
  // client rule would reject valid passwords it cannot know about.
  password: z.string().min(1, 'Enter your password.'),
});

type LoginValues = z.infer<typeof loginSchema>;

interface LocationState {
  from?: string;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    // The user should not be told a field is wrong before trying to submit.
    mode: 'onSubmit',
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await login(values.email, values.password);
      const state = location.state as LocationState | null;
      navigate(state?.from ?? '/dashboard', { replace: true });
    } catch (error) {
      setFormError(toMessage(error));
    }
  });

  return (
    <div className="flex min-h-full flex-col justify-center bg-white px-4 py-12 sm:bg-surface-sunken">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-600 text-xl font-bold text-white">
            CM
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Charity Management System
          </h1>
          <p className="mt-2 text-sm text-ink-subtle">
            Sign in to manage donors, beneficiaries and donations.
          </p>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-card sm:p-8">
          <form onSubmit={onSubmit} noValidate className="space-y-5">
            {formError ? <ErrorState error={new Error(formError)} /> : null}

            <Field label="Email address" required error={errors.email?.message}>
              {({ id, hasError, describedBy }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  hasError={hasError}
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="you@example.org"
                  {...register('email')}
                />
              )}
            </Field>

            <Field label="Password" required error={errors.password?.message}>
              {({ id, hasError, describedBy }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  hasError={hasError}
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')}
                />
              )}
            </Field>

            <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full">
              Sign in
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-ink-subtle">
          Need an account? Create one with{' '}
          <code className="rounded bg-neutral-100 px-1 py-0.5 font-mono">npm run user:create</code>{' '}
          in the backend project.
        </p>

        <p className="mt-4 text-center text-xs text-ink-subtle">
          <Link to="/api/docs" className="underline underline-offset-2 hover:text-ink">
            API documentation
          </Link>
        </p>
      </div>
    </div>
  );
}
