import { requireOrg } from '@/lib/session';
import { computeAnomalies, groupBy } from '@/lib/intel';
import { Empty, PageHeader } from '@/components/ui';

export default async function Quality() {
  const { sb } = await requireOrg();
  const { anomalies, sufficientAnywhere, findings, totalFindings } = await computeAnomalies(sb);
  const [lines, suppliers] = await Promise.all([sb.from('production_lines').select('id,name'), sb.from('suppliers').select('id,name')]);
  const nm = (r: { data: { id: string; name: string }[] | null }) => new Map((r.data ?? []).map((x) => [x.id, x.name]));
  const ln = nm(lines), sn = nm(suppliers);
  const table = (title: string, g: Map<string, unknown[]>, names: Map<string, string>) => {
    const rows = [...g].map(([id, v]) => [names.get(id) ?? id, v.length] as const).sort((a, b) => b[1] - a[1]);
    return (
      <section className="panel"><h2 className="display text-3xl">{title}</h2>
        {rows.length === 0 ? <p className="mt-2 text-sm text-char/70">No findings are linked to this dimension yet.</p> :
          <table className="tbl mt-2"><thead><tr><th scope="col">Name</th><th scope="col">Findings (16 wks)</th></tr></thead><tbody>{rows.map(([n, c]) => <tr key={n}><td>{n}</td><td>{c}</td></tr>)}</tbody></table>}
        <p className="mt-2 text-xs text-char/60">Counts only. Counts alone are not a risk score; volumes differ between lines and suppliers.</p>
      </section>);
  };
  return (
    <>
      <PageHeader title="Quality Intelligence" intro="Deterministic statistics from your stored findings. Patterns are associations that require investigation, not proven causes." />
      <section className="panel mb-6"><h2 className="display text-3xl">Anomalies</h2>
        {anomalies.length === 0 ? <div className="mt-3"><Empty title={sufficientAnywhere ? 'No unusual change detected' : 'No anomaly baseline yet'}>{sufficientAnywhere ? 'Current activity is within the range of your recent history. This is not a food-safety conclusion.' : 'Not enough historical data to establish an anomaly baseline. At least 4 weeks with findings are needed.'}</Empty></div> :
          <ul className="mt-3 space-y-4">{anomalies.map((a) => (
            <li key={a.scope} className="border-l-4 border-burgundy bg-cream p-4 text-sm">
              <p className="font-bold">{a.whatChanged}</p>
              <p>Magnitude: {a.magnitudePct !== null ? `+${a.magnitudePct}%` : 'n/a'} · z-score {a.zScore} · baseline from {a.weeksOfBaseline} active weeks · confidence {a.confidence}</p>
              <p className="text-char/70">Possible contributors are not determined by this calculation. Run the Quality Agent or open an incident to investigate.</p>
            </li>))}</ul>}
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        {table('By production line', groupBy(findings, (f) => f.inspections?.line_id ?? null), ln)}
        {table('By supplier', groupBy(findings, (f) => f.inspections?.supplier_id ?? null), sn)}
      </div>
      <p className="mt-4 text-xs text-char/60">{totalFindings} findings analysed (rejected and false positives excluded).</p>
    </>
  );
}
