import { redirect } from 'next/navigation';
import { createClient, supabaseConfigured } from '@/lib/supabase/server';
import { createOrganization } from '../app/actions';
import { ErrorBanner } from '@/components/ui';
import { Logo } from '@/components/Logo';

export const dynamic = 'force-dynamic';

export default async function Onboarding({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (!supabaseConfigured) redirect('/sign-in?error=not_configured');
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/sign-in');
  const { data: m } = await sb.from('organization_members').select('org_id').eq('user_id', user.id).limit(1).maybeSingle();
  if (m) redirect('/app');
  const { error } = await searchParams;
  return (
    <div className="grid min-h-screen place-items-center bg-burgundy p-6">
      <form action={createOrganization} className="w-full max-w-md space-y-4 bg-ivory p-8">
        <span className="text-burgundy"><Logo /></span>
        <h1 className="display text-5xl">Set up your organization</h1>
        <p className="text-sm text-char/70">Your data is isolated to this organization. You will be its owner.</p>
        <ErrorBanner error={error} />
        <div><label className="label" htmlFor="name">Organization name</label><input id="name" name="name" required minLength={2} className="field" /></div>
        <div><label className="label" htmlFor="ind">Type of operation</label>
          <select id="ind" name="industry" className="field"><option>Food manufacturer</option><option>Food processor</option><option>Restaurant / restaurant group</option><option>Distributor / warehouse</option><option>Retailer</option><option>Other</option></select></div>
        <button className="btn btn-dark w-full justify-center">Create organization</button>
      </form>
    </div>
  );
}
