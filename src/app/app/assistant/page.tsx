import { requireOrg } from '@/lib/session';
import { geminiConfigured } from '@/lib/ai/gemini';
import { AgentOutputView } from '@/components/AgentOutputView';
import { Empty, ErrorBanner, PageHeader } from '@/components/ui';
import { askAssistant } from '../actions';
import type { AgentOutput } from '@/lib/ai/schemas';

export default async function Assistant({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { sb } = await requireOrg();
  const { data: runs } = await sb.from('ai_agent_runs').select('id,input,output,status,created_at').eq('agent', 'assistant').order('created_at', { ascending: false }).limit(10);
  return (
    <>
      <PageHeader title="AI Assistant" intro="Ask questions about your own quality data. Answers use only records you are authorized to see." />
      <ErrorBanner error={error} />
      <form action={askAssistant} className="panel mb-6 flex flex-wrap gap-3">
        <label htmlFor="q" className="sr-only">Question</label>
        <input id="q" name="question" required maxLength={1000} placeholder="Which production line had the most confirmed findings recently?" className="field min-w-64 flex-1" />
        <button className="btn-sm" disabled={!geminiConfigured()}>Ask</button>
      </form>
      {(runs ?? []).length === 0 ? <Empty title="No questions yet">Ask about findings, batches, suppliers or incidents. If the data cannot answer, the assistant will say what is missing.</Empty> :
        <div className="space-y-4">{runs!.filter((r) => r.status === 'completed').map((r) => <article key={r.id} className="panel"><p className="display text-2xl">{(r.input as { question?: string })?.question}</p><div className="mt-2"><AgentOutputView o={r.output as AgentOutput} /></div></article>)}</div>}
    </>
  );
}
