import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AiOperation } from '@/lib/pricing';
import { generateStructured } from './gemini';
import { AgentOutputSchema, agentJsonSchema, type AgentOutput } from './schemas';
import { withCredits } from './credits';
import { buildOrgContext } from './context';

export const AGENTS = {
  inspection: { name: 'Inspection Agent', prompt: 'Review the recent visual findings. Identify repeated or related findings (same category, product, line, supplier, batch). Report what is directly recorded only.' },
  quality: { name: 'Quality Agent', prompt: 'Connect findings to quality trends using computed_anomalies and recent_findings. Only describe trends the data supports; if baseline_available is false, say there is not enough history to establish a baseline.' },
  food_safety: { name: 'Food Safety Intelligence Agent', prompt: 'Identify areas that may require attention by qualified food-safety personnel using findings, incidents and HACCP records. Never assert hazards the data cannot establish; state when testing or human review is required.' },
  supplier_risk: { name: 'Supplier Risk Agent', prompt: 'Look for supplier-associated patterns across findings, batches and incidents. Show the evidence for any signal. Do not produce scores or signals from insufficient data.' },
  incident: { name: 'Incident Investigation Agent', prompt: 'Organize evidence for the focus incident (or the most recent open incident): observed evidence, related historical patterns, possible contributors (hypotheses only) and concrete investigation steps.' },
  recall: { name: 'Recall Intelligence Agent', prompt: 'Identify batches/products that may be related to the focus incident or recurring findings, to support scope analysis. Never recommend announcing a recall; the decision belongs to authorized humans.' },
  assistant: { name: 'AI Assistant', prompt: 'Answer the user_question using only organization_context. If the context cannot answer it, say what data is missing. Put your answer in headline and supporting detail in the other fields.' },
  operations: { name: 'Quality Operations Agent', prompt: 'Using earlier agent outputs, produce a short prioritized list of operational actions with a clear definition of done. Do not invent urgency.' },
} as const;
export type AgentId = keyof typeof AGENTS;
export const PIPELINE: AgentId[] = ['inspection', 'quality', 'supplier_risk', 'incident', 'operations'];

const OP: Record<AgentId, AiOperation> = { inspection: 'agent_run', quality: 'agent_run', food_safety: 'agent_run', supplier_risk: 'agent_run', incident: 'incident_investigation', recall: 'recall_intelligence', assistant: 'ai_question', operations: 'agent_run' };

export async function runAgent(sb: SupabaseClient, ctx: { orgId: string; userId: string }, id: AgentId, opts: { incidentId?: string; prior?: Record<string, AgentOutput>; question?: string } = {}) {
  const def = AGENTS[id];
  const { data: run } = await sb.from('ai_agent_runs').insert({ org_id: ctx.orgId, agent: id, trigger: opts.prior ? 'orchestration' : 'manual', input: { incidentId: opts.incidentId ?? null, question: opts.question ?? null }, created_by: ctx.userId }).select('id').single();
  try {
    const out = await withCredits(sb, ctx, OP[id], async () => {
      const context = await buildOrgContext(sb, { incidentId: opts.incidentId });
      const { data, usage } = await generateStructured({
        schema: AgentOutputSchema, jsonSchema: agentJsonSchema,
        system: `You are the ${def.name}. ${def.prompt}\nIf the data is thin, set data_sufficient=false, keep lists short, and say what data is needed.`,
        parts: [{ text: JSON.stringify({ today: new Date().toISOString(), organization_context: context, prior_agent_outputs: opts.prior ?? {}, user_question: opts.question ?? null }) }],
      });
      return { result: data, usage };
    });
    await sb.from('ai_agent_runs').update({ status: 'completed', output: out, finished_at: new Date().toISOString() }).eq('id', run!.id);
    return { runId: run!.id as string, output: out };
  } catch (e) {
    await sb.from('ai_agent_runs').update({ status: 'failed', output: { error: e instanceof Error ? e.message : 'failed' }, finished_at: new Date().toISOString() }).eq('id', run!.id);
    throw e;
  }
}

/** Multi-agent orchestration: each agent receives the structured outputs of those before it. */
export async function runPipeline(sb: SupabaseClient, ctx: { orgId: string; userId: string }, incidentId?: string) {
  const prior: Record<string, AgentOutput> = {};
  for (const id of PIPELINE) {
    const { output } = await runAgent(sb, ctx, id, { incidentId, prior });
    prior[id] = output;
  }
  const ops = prior.operations;
  if (ops?.recommended_actions?.length) {
    await sb.from('ai_insights').insert({ org_id: ctx.orgId, kind: 'pipeline', title: ops.headline, body: prior, confidence: ops.confidence });
  }
  return prior;
}
