import Link from 'next/link';
import { requireOrg } from '@/lib/session';
import { computeAnomalies, weeklySeries } from '@/lib/intel';
import { Badge, Empty, PageHeader, Stat } from '@/components/ui';
import { TrendChart } from '@/components/TrendChart';

const count = async (p: PromiseLike<{ count: number | null }>) => (await p).count ?? 0;

export default async function Overview() {
  const { sb, orgName } = await requireOrg();
  const head = { count: 'exact' as const, head: true };
  const [inspections, openIncidents, openActions, critical, anomalyInfo, recent, insights] = await Promise.all([
    count(sb.from('inspections').select('id', head)),
    count(sb.from('incidents').select('id', head).in('status', ['open', 'investigating'])),
    count(sb.from('corrective_actions').select('id', head).in('status', ['open', 'in_progress'])),
    count(sb.from('visual_findings').select('id', head).eq('severity', 'critical').eq('review_status', 'pending')),
    computeAnomalies(sb),
    sb.from('visual_findings').select('id,finding,severity,review_status,inspection_id,created_at').order('created_at', { ascending: false }).limit(6),
    sb.from('ai_insights').select('id,title,created_at,body').order('created_at', { ascending: false }).limit(3),
  ]);
  const { findings, anomalies, sufficientAnywhere } = anomalyInfo;
  const confirmed = findings.filter((f) => f.review_status === 'confirmed').length;
  const series = weeklySeries(findings, 12).map((s) => ({ label: s.weekAgo === 0 ? 'now' : `-${s.weekAgo}w`, count: s.count }));
  const nothing = inspections === 0;

  return (
    <>
      <PageHeader title="Overview" intro={`What changed, what looks unusual and what needs attention at ${orgName}.`} />
      {nothing && <div className="mb-6"><Empty title="Start your first inspection" href="/app/inspections/new" cta="New inspection">Upload an inspection image and connect it to a product or batch to begin building your quality intelligence.</Empty></div>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Inspections" value={inspections} />
        <Stat label="Findings awaiting review" value={findings.filter((f) => f.review_status === 'pending').length} hint={`${confirmed} confirmed`} />
        <Stat label="Critical items to review" value={critical} />
        <Stat label="Open incidents / actions" value={`${openIncidents} / ${openActions}`} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="panel"><h2 className="display text-3xl">Findings per week</h2>
          {findings.length === 0 ? <p className="mt-3 text-sm text-char/70">More operational data is needed. Run inspections or import quality records to identify patterns over time.</p> : <TrendChart data={series} />}
        </section>
        <section className="panel"><h2 className="display text-3xl">Anomalies</h2>
          {anomalies.length > 0 ? <ul className="mt-3 space-y-3 text-sm">{anomalies.slice(0, 4).map((a) => <li key={a.scope} className="border-l-4 border-burgundy pl-3"><b>{a.whatChanged}</b><br /><span className="text-char/70">+{a.magnitudePct ?? '—'}% vs baseline · {a.confidence} confidence · associated, requires investigation</span></li>)}</ul>
            : <p className="mt-3 text-sm text-char/70">{sufficientAnywhere ? 'No statistically unusual change was found against the current baseline. This is not a safety conclusion.' : 'Not enough historical data to establish an anomaly baseline.'}</p>}
          <Link href="/app/quality" className="mt-3 inline-block text-sm font-bold text-burgundy underline">Open Quality Intelligence</Link>
        </section>
        <section className="panel"><h2 className="display text-3xl">Recent AI findings</h2>
          {(recent.data ?? []).length === 0 ? <p className="mt-3 text-sm text-char/70">No AI findings yet.</p> : <ul className="mt-3 divide-y divide-sand text-sm">{recent.data!.map((f) => <li key={f.id} className="flex items-center justify-between gap-3 py-2"><Link className="underline" href={`/app/inspections/${f.inspection_id}`}>{f.finding}</Link><span className="flex gap-1"><Badge v={f.severity} /><Badge v={f.review_status} /></span></li>)}</ul>}
        </section>
        <section className="panel"><h2 className="display text-3xl">Recommended actions</h2>
          {(insights.data ?? []).length === 0 ? <p className="mt-3 text-sm text-char/70">Run the agent pipeline to generate prioritized recommendations from your data.</p> : <ul className="mt-3 space-y-2 text-sm">{insights.data!.map((i) => <li key={i.id}>{i.title}</li>)}</ul>}
          <Link href="/app/agents" className="mt-3 inline-block text-sm font-bold text-burgundy underline">Open AI Agents</Link>
        </section>
      </div>
    </>
  );
}
