import 'server-only';
import { redirect } from 'next/navigation';
import { createClient, supabaseConfigured } from '@/lib/supabase/server';

export type Role = 'owner' | 'admin' | 'quality_manager' | 'food_safety' | 'production_manager' | 'inspector';
export const ROLE_LABEL: Record<Role, string> = {
  owner: 'Owner', admin: 'Admin', quality_manager: 'Quality Manager', food_safety: 'Food Safety / Compliance', production_manager: 'Production Manager', inspector: 'Inspector',
};

/** Resolves the signed-in user and their organization. Redirects when unauthenticated / not onboarded. */
export async function requireOrg() {
  if (!supabaseConfigured) redirect('/sign-in?error=not_configured');
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/sign-in');
  const { data: m } = await sb.from('organization_members').select('org_id, role, organizations(name)').eq('user_id', user.id).order('created_at').limit(1).maybeSingle();
  if (!m) redirect('/onboarding');
  const org = m.organizations as unknown as { name: string } | null;
  return { sb, user, orgId: m.org_id as string, role: m.role as Role, orgName: org?.name ?? 'Organization' };
}

export const can = {
  manage: (r: Role) => ['owner', 'admin', 'quality_manager'].includes(r),
  admin: (r: Role) => ['owner', 'admin'].includes(r),
  runAi: (_r: Role) => true,
};
