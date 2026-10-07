import { requireOrg } from '@/lib/session';
import { AGENTS, PIPELINE } from '@/lib/ai/agents';
import { geminiConfigured } from '@/lib/ai/gemini';
import { CREDIT_COST } from '@/lib/pricing';
import { AgentOutputView } from '@/components/AgentOutputView';
import { Badge, Empty, ErrorBanner, PageHeader } from '@/components/ui';
import { runAgentAction } from '../actions';
import type { AgentOutput } from '@/lib/ai/schemas';

export default async function Agents({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { sb } = await requireOrg();
  const [{ data: runs }, { data: incidents }] = await Promise.all([
    sb.from('ai_agent_runs').select('id,agent,trigger,status,output,created_at').neq('agent', 'assistant').order('created_at', { ascending: false }).limit(15),
    sb.from('incidents').select('id,title').in('status', ['open', 'investigating']),
  ]);
  const ready = geminiConfigured();
  return (
    <>
      <PageHeader title="AI Agents" intro="Specialized agents hand structured intelligence to one another. Every run is recorded, validated and charged to your credits." />
      <ErrorBanner error={error} />
      {!ready && <p className="mb-4 border-l-4 border-amber bg-cream p-3 text-sm">The AI service is not configured on this server (GEMINI_API_KEY). Agents are unavailable until it is.</p>}
      <form action={runAgentAction} className="panel mb-6 flex flex-wrap items-end gap-3">
        <input type="hidden" name="agent" value="pipeline" />
        <div><p className="display text-3xl">Run the full pipeline</p><p className="text-xs text-char/70">{PIPELINE.map((a) => AGENTS[a].name).join(' → ')} · {PIPELINE.length * CREDIT_COST.agent_run}+ credits</p></div>
        <div><label className="label" htmlFor="inc">Focus incident (optional)</label><select id="inc" name="incident_id" className="field"><option value="">— none —</option>{(incidents ?? []).map((i) => <option key={i.id} value={i.id}>{i.title}</option>)}</select></div>
        <button className="btn-sm" disabled={!ready}>Run pipeline</button>
      </form>
      <div className="mb-8 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {(Object.keys(AGENTS) as (keyof typeof AGENTS)[]).filter((a) => a !== 'assistant').map((a) => (
          <form key={a} action={runAgentAction} className="panel"><input type="hidden" name="agent" value={a} /><h2 className="display text-2xl">{AGENTS[a].name}</h2><p className="mt-1 text-xs text-char/70">{AGENTS[a].prompt.split('.')[0]}.</p><button className="btn-sm mt-3" disabled={!ready}>Run agent</button></form>))}
      </div>
      <h2 className="display mb-3 text-3xl">Run history</h2>
      {(runs ?? []).length === 0 ? <Empty title="No agent runs yet">Runs appear here with their evidence, patterns, possible contributors and recommended actions.</Empty> : (
        <div className="space-y-4">{runs!.map((r) => (
          <article key={r.id} className="panel"><div className="mb-2 flex flex-wrap items-center gap-2"><h3 className="display text-2xl">{AGENTS[r.agent as keyof typeof AGENTS]?.name ?? r.agent}</h3><Badge v={r.status} /><span className="text-xs text-char/60">{r.trigger} · {r.created_at.slice(0, 16).replace('T', ' ')}</span></div>
            {r.status === 'completed' ? <AgentOutputView o={r.output as AgentOutput} /> : <p className="text-sm text-burgundy">{(r.output as { error?: string } | null)?.error ?? 'Running…'}</p>}</article>))}</div>)}
    </>
  );
}
