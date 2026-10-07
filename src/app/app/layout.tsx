import { AppShell } from '@/components/AppShell';
import { getBalance } from '@/lib/ai/credits';
import { LOW_CREDIT_THRESHOLD } from '@/lib/pricing';
import { requireOrg, ROLE_LABEL } from '@/lib/session';
import { signOut } from './actions';

export const dynamic = 'force-dynamic';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { sb, user, orgName, role, orgId } = await requireOrg();
  const bal = await getBalance(sb, orgId);
  const low = !bal || bal.allocated === 0 || (bal.allocated - bal.used) / bal.allocated < LOW_CREDIT_THRESHOLD;
  return <AppShell orgName={orgName} roleLabel={ROLE_LABEL[role]} email={user.email ?? ''} lowCredits={low} signOut={signOut}>{children}</AppShell>;
}
