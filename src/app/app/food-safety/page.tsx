import Link from 'next/link';
import { requireOrg } from '@/lib/session';
import { Badge, Empty, PageHeader } from '@/components/ui';

export default async function FoodSafety() {
  const { sb } = await requireOrg();
  const [{ data: hazards }, { data: incidents }, { data: crit }] = await Promise.all([
    sb.from('haccp_records').select('id,hazard,ccp,deviation').not('deviation', 'is', null).order('created_at', { ascending: false }).limit(10),
    sb.from('incidents').select('id,title,severity,status').in('status', ['open', 'investigating']).order('created_at', { ascending: false }).limit(10),
    sb.from('visual_findings').select('id,finding,severity,inspection_id').in('severity', ['high', 'critical']).eq('review_status', 'pending').limit(10),
  ]);
  const none = !(hazards?.length || incidents?.length || crit?.length);
  return (
    <>
      <PageHeader title="Food Safety" intro="Areas that may require attention by qualified personnel, gathered from your own records." />
      <p className="mb-6 border-l-4 border-amber bg-cream p-3 text-sm">FoodVision AI organizes evidence. It does not detect pathogens, toxins, chemicals or allergens from images and does not certify compliance. Additional testing or qualified human review is required for any safety determination.</p>
      {none ? <Empty title="Nothing to surface yet" href="/app/haccp" cta="Add HACCP records">There are no deviations, open incidents or high-severity unreviewed findings. This is not evidence that nothing needs attention; it reflects only what has been recorded.</Empty> : (
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="panel"><h2 className="display text-2xl">HACCP deviations</h2><ul className="mt-2 space-y-2 text-sm">{hazards?.map((h) => <li key={h.id}><b>{h.hazard}</b> {h.ccp && `· ${h.ccp}`}<br />{h.deviation}</li>)}</ul></section>
          <section className="panel"><h2 className="display text-2xl">Open incidents</h2><ul className="mt-2 space-y-2 text-sm">{incidents?.map((i) => <li key={i.id}>{i.title} <Badge v={i.severity} /></li>)}</ul></section>
          <section className="panel"><h2 className="display text-2xl">Unreviewed high-severity findings</h2><ul className="mt-2 space-y-2 text-sm">{crit?.map((f) => <li key={f.id}><Link className="underline" href={`/app/inspections/${f.inspection_id}`}>{f.finding}</Link> <Badge v={f.severity} /></li>)}</ul></section>
        </div>)}
    </>
  );
}
