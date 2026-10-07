import Link from 'next/link';
import { requireOrg, ROLE_LABEL } from '@/lib/session';
import { PageHeader } from '@/components/ui';

export default async function Settings() {
  const { orgName, role, user } = await requireOrg();
  return (
    <>
      <PageHeader title="Settings" />
      <dl className="panel max-w-xl space-y-3 text-sm">
        <div><dt className="label">Organization</dt><dd>{orgName}</dd></div>
        <div><dt className="label">Your role</dt><dd>{ROLE_LABEL[role]}</dd></div>
        <div><dt className="label">Email</dt><dd>{user.email}</dd></div>
      </dl>
      <p className="mt-4 text-sm">Configure classification criteria in <Link className="font-bold text-burgundy underline" href="/app/standards">Quality Standards</Link>. Manage sites under <Link className="font-bold text-burgundy underline" href="/app/facilities">Facilities</Link>.</p>
    </>
  );
}
