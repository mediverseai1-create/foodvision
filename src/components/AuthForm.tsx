'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { Logo } from './Logo';

type Mode = 'sign-in' | 'sign-up' | 'forgot' | 'reset';
const schema = z.object({
  full_name: z.string().optional(),
  email: z.string().email('Enter a valid email address').optional().or(z.literal('')),
  password: z.string().min(8, 'Use at least 8 characters').optional().or(z.literal('')),
});
type V = z.infer<typeof schema>;

const COPY: Record<Mode, { title: string; cta: string }> = {
  'sign-in': { title: 'Sign in', cta: 'Sign in' },
  'sign-up': { title: 'Create your account', cta: 'Get started' },
  forgot: { title: 'Reset password', cta: 'Send reset link' },
  reset: { title: 'Choose a new password', cta: 'Update password' },
};

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [msg, setMsg] = useState<{ kind: 'error' | 'ok'; text: string } | null>(
    sp.get('error') === 'not_configured' ? { kind: 'error', text: 'Supabase is not configured on this deployment yet.' } : null,
  );
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<V>({ resolver: zodResolver(schema) });

  async function onSubmit(v: V) {
    setMsg(null);
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return setMsg({ kind: 'error', text: 'Supabase is not configured.' });
    const sb = createClient();
    const origin = window.location.origin;
    const need = (k: 'email' | 'password') => { if (!v[k]) { setMsg({ kind: 'error', text: `${k === 'email' ? 'Email' : 'Password'} is required.` }); return false; } return true; };
    if (mode === 'sign-in') {
      if (!need('email') || !need('password')) return;
      const { error } = await sb.auth.signInWithPassword({ email: v.email!, password: v.password! });
      if (error) return setMsg({ kind: 'error', text: error.message });
      const next = sp.get('next');
      router.replace(next && next.startsWith('/app') ? next : '/app'); router.refresh();
    } else if (mode === 'sign-up') {
      if (!need('email') || !need('password')) return;
      const { data, error } = await sb.auth.signUp({ email: v.email!, password: v.password!, options: { data: { full_name: v.full_name }, emailRedirectTo: `${origin}/auth/callback?next=/app` } });
      if (error) return setMsg({ kind: 'error', text: error.message });
      if (data.session) { router.replace('/app'); router.refresh(); } else setMsg({ kind: 'ok', text: 'Check your email to confirm your account, then sign in.' });
    } else if (mode === 'forgot') {
      if (!need('email')) return;
      const { error } = await sb.auth.resetPasswordForEmail(v.email!, { redirectTo: `${origin}/auth/callback?next=/reset-password` });
      setMsg(error ? { kind: 'error', text: error.message } : { kind: 'ok', text: 'If that email exists, a reset link is on its way.' });
    } else {
      if (!need('password')) return;
      const { error } = await sb.auth.updateUser({ password: v.password! });
      if (error) return setMsg({ kind: 'error', text: error.message });
      router.replace('/app');
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden bg-burgundy p-12 text-ivory md:flex md:flex-col md:justify-between">
        <Link href="/"><Logo light /></Link>
        <p className="display display-shadow text-7xl">Turn every inspection into intelligence.</p>
        <p className="text-sm text-ivory/70">Decision support for qualified food-quality professionals.</p>
      </div>
      <div className="flex items-center justify-center bg-ivory p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm space-y-4" noValidate>
          <Link href="/" className="text-burgundy md:hidden"><Logo /></Link>
          <h1 className="display text-5xl">{COPY[mode].title}</h1>
          {msg && <p role="alert" className={`p-3 text-sm ${msg.kind === 'error' ? 'bg-rose/10 text-burgundy' : 'bg-sage-soft text-sage'}`}>{msg.text}</p>}
          {mode === 'sign-up' && <div><label className="label" htmlFor="fn">Full name</label><input id="fn" className="field" autoComplete="name" {...register('full_name')} /></div>}
          {mode !== 'reset' && <div><label className="label" htmlFor="em">Email</label><input id="em" type="email" className="field" autoComplete="email" aria-invalid={!!errors.email} {...register('email')} />{errors.email && <p className="mt-1 text-xs text-burgundy">{errors.email.message}</p>}</div>}
          {mode !== 'forgot' && <div><label className="label" htmlFor="pw">{mode === 'reset' ? 'New password' : 'Password'}</label><input id="pw" type="password" className="field" autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} aria-invalid={!!errors.password} {...register('password')} />{errors.password && <p className="mt-1 text-xs text-burgundy">{errors.password.message}</p>}</div>}
          <button className="btn btn-dark w-full justify-center" disabled={isSubmitting}>{isSubmitting ? 'Please wait…' : COPY[mode].cta}</button>
          <div className="flex justify-between text-sm">
            {mode === 'sign-in' && <><Link className="underline" href="/sign-up">Create account</Link><Link className="underline" href="/forgot-password">Forgot password?</Link></>}
            {mode === 'sign-up' && <Link className="underline" href="/sign-in">Already have an account? Sign in</Link>}
            {mode === 'forgot' && <Link className="underline" href="/sign-in">Back to sign in</Link>}
          </div>
        </form>
      </div>
    </div>
  );
}
