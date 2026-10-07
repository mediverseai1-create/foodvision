import { acceptRecommendation } from '@/app/app/actions';
import type { AgentOutput } from '@/lib/ai/schemas';

const List = ({ title, items }: { title: string; items: string[] }) => items?.length ? (
  <div><h4 className="label">{title}</h4><ul className="list-disc space-y-1 pl-5 text-sm">{items.map((i, k) => <li key={k}>{i}</li>)}</ul></div>) : null;

export function AgentOutputView({ o, canAct = true }: { o: AgentOutput; canAct?: boolean }) {
  return (
    <div className="space-y-3">
      <p className="font-bold">{o.headline}</p>
      {!o.data_sufficient && <p className="border-l-4 border-amber bg-cream p-2 text-xs">Data was insufficient for a firm conclusion.</p>}
      <List title="Observed evidence" items={o.observed_evidence} />
      <List title="Related patterns" items={o.related_patterns} />
      <List title="Possible contributors (hypotheses requiring review)" items={o.possible_contributors} />
      {o.recommended_actions.length > 0 && (
        <div><h4 className="label">Recommended actions</h4>
          <ul className="space-y-2">{o.recommended_actions.map((a, k) => (
            <li key={k} className="flex flex-wrap items-center justify-between gap-2 bg-cream p-2 text-sm">
              <span><b>{a.title}</b> <span className="text-char/60">· {a.priority} · done when: {a.definition_of_done}</span></span>
              {canAct && <form action={acceptRecommendation}><input type="hidden" name="title" value={a.title} /><input type="hidden" name="priority" value={a.priority} /><input type="hidden" name="dod" value={a.definition_of_done} /><button className="btn-sm ghost !py-1">Create action</button></form>}
            </li>))}</ul></div>)}
      <p className="text-xs text-char/60">Confidence {Math.round(o.confidence * 100)}% · {o.limitations}</p>
    </div>
  );
}
