import { requireOrg } from '@/lib/session';
import { getBalance } from '@/lib/ai/credits';
import { LOW_CREDIT_THRESHOLD, PLANS, paymentLink, planCredits } from '@/lib/pricing';
import { Empty, PageHeader, Stat } from '@/components/ui';

export default async function Usage() {
  const { sb, orgId } = await requireOrg();
  const bal = await getBalance(sb, orgId);
  const { data: tx } = await sb.from('credit_transactions').select('*').order('created_at', { ascending: false }).limit(100);
  const alloc = bal?.allocated ?? 0, used = bal?.used ?? 0, left = alloc - used;
  const low = alloc === 0 || left / alloc < LOW_CREDIT_THRESHOLD;
  const byOp = new Map<string, number>();
  (tx ?? []).forEach((t) => byOp.set(t.operation, (byOp.get(t.operation) ?? 0) + t.credits));
  return (
    <>
      <PageHeader title="Usage / Billing" intro="Credits are deducted server-side after each AI operation." />
      {low && <p role="alert" className="mb-4 border-l-4 border-amber bg-cream p-3 text-sm">{alloc === 0 ? 'No credits are allocated to this organization yet. Choose a plan below; AI features need credits.' : 'Credits are running low.'}</p>}
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Plan" value={<span className="capitalize">{bal?.plan ?? 'trial'}</span>} /><Stat label="Allocated" value={alloc} /><Stat label="Used" value={used} /><Stat label="Remaining" value={left} />
      </div>
      <p className="mt-2 text-xs text-char/60">Billing period started {bal?.period_start.slice(0, 10)}. Until payment-provider confirmation is connected, credits are allocated by the account administrator after payment is verified.</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="panel"><h2 className="display text-3xl">Plans</h2>
          <ul className="mt-2 space-y-3">{PLANS.map((p) => { const l = paymentLink(p.id); const c = planCredits(p.id); return (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-sand pb-2">
              <span><b>{p.name}</b> ${p.price}/mo <span className="text-xs text-char/60">{c ? `· ${c} credits` : '· credits TBD'}</span></span>
              {l ? <a className="btn-sm" href={l} rel="noopener">Choose</a> : <span className="text-xs font-bold">Payment link coming soon</span>}
            </li>); })}</ul></section>
        <section className="panel"><h2 className="display text-3xl">By category</h2>
          {byOp.size === 0 ? <p className="mt-2 text-sm text-char/70">No usage recorded.</p> : <ul className="mt-2 text-sm">{[...byOp].map(([k, v]) => <li key={k} className="flex justify-between border-b border-sand py-1"><span>{k.replace(/_/g, ' ')}</span><b>{v}</b></li>)}</ul>}</section>
      </div>
      <h2 className="display mb-2 mt-8 text-3xl">History</h2>
      {(tx ?? []).length === 0 ? <Empty title="No usage yet">AI operations will be listed here with the credits they used.</Empty> : (
        <div className="overflow-x-auto border border-sand bg-white"><table className="tbl"><caption className="sr-only">Credit transactions</caption>
          <thead><tr><th scope="col">When</th><th scope="col">Operation</th><th scope="col">Credits</th><th scope="col">Model</th></tr></thead>
          <tbody>{tx!.map((t) => <tr key={t.id}><td>{t.created_at.slice(0, 16).replace('T', ' ')}</td><td>{t.operation.replace(/_/g, ' ')}</td><td>{t.credits}</td><td>{t.model}</td></tr>)}</tbody></table></div>)}
    </>
  );
}
