import { requireOrg, can, ROLE_LABEL, type Role } from '@/lib/session';
import { PageHeader } from '@/components/ui';

export default async function Team() {
  const { sb, orgId, role, user } = await requireOrg();
  const { data } = await sb.from('organization_members').select('user_id,role,created_at').eq('org_id', orgId);
  const rows = (data ?? []) as { user_id: string; role: Role; created_at: string }[];
  const { data: profs } = await sb.from('profiles').select('id,full_name').in('id', rows.map((r) => r.user_id));
  const names = new Map((profs ?? []).map((p) => [p.id, p.full_name as string | null]));
  return (
    <>
      <PageHeader title="Team" intro="Roles are enforced by database policies, not just hidden buttons." />
      <div className="overflow-x-auto border border-sand bg-white">
        <table className="tbl"><caption className="sr-only">Team members</caption>
          <thead><tr><th scope="col">Member</th><th scope="col">Role</th><th scope="col">Joined</th></tr></thead>
          <tbody>{rows.map((m) => <tr key={m.user_id}><td>{names.get(m.user_id) || m.user_id.slice(0, 8)}{m.user_id === user.id && ' (you)'}</td><td>{ROLE_LABEL[m.role]}</td><td>{m.created_at.slice(0, 10)}</td></tr>)}</tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-char/70">{can.admin(role) ? 'Email invitations are coming soon. Until then, a new member signs up and an admin assigns their role in Supabase.' : 'Only owners and admins can manage members.'}</p>
    </>
  );
}
