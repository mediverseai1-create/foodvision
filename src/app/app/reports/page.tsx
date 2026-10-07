import { requireOrg } from '@/lib/session';
import { geminiConfigured } from '@/lib/ai/gemini';
import { CREDIT_COST } from '@/lib/pricing';
import { Empty, ErrorBanner, PageHeader } from '@/components/ui';
import { generateReport } from '../actions';

type R = {
  id: string; title: string; created_at: string; data_section: Record<string, number>;
  interpretation: { headline: string; evidence: string[]; patterns: string[]; contributors: string[]; limitations: string };
  recommendations: { title: string; priority: string; definition_of_done: string }[];
};

export default async function Reports({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { sb } = await requireOrg();
  const { data } = await sb.from('reports').select('*').order('created_at', { ascending: false }).limit(20);
  const rows = (data ?? []) as R[];
  return (
    <>
      <PageHeader title="Reports" intro="Each report separates recorded data, AI interpretation and recommended action."
        action={<form action={generateReport}><button className="btn-sm" disabled={!geminiConfigured()}>Generate quality summary ({CREDIT_COST.agent_run} credits)</button></form>} />
      <ErrorBanner error={error} />
      {rows.length === 0 ? <Empty title="No reports yet">Generate a quality summary once you have inspections or incidents to summarize.</Empty> : rows.map((r) => (
        <article key={r.id} className="panel mb-5">
          <h2 className="display text-3xl">{r.title}</h2>
          <h3 className="label mt-3">1 · Data</h3>
          <dl className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">{Object.entries(r.data_section).map(([k, v]) => <div key={k}><dt className="text-char/60">{k.replace(/_/g, ' ')}</dt><dd className="display text-3xl">{v}</dd></div>)}</dl>
          <h3 className="label mt-3">2 · AI interpretation</h3>
          <p className="text-sm font-bold">{r.interpretation.headline}</p>
          <ul className="list-disc pl-5 text-sm">{[...r.interpretation.evidence, ...r.interpretation.patterns].map((x, i) => <li key={i}>{x}</li>)}</ul>
          <p className="mt-1 text-xs text-char/60">{r.interpretation.limitations}</p>
          <h3 className="label mt-3">3 · Recommended actions</h3>
          <ul className="list-disc pl-5 text-sm">{r.recommendations.map((a, i) => <li key={i}>{a.title} <span className="text-char/60">({a.priority})</span></li>)}</ul>
        </article>))}
    </>
  );
}
