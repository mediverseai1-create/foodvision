import type { SupabaseClient } from '@supabase/supabase-js';

/** Deterministic quality statistics. No AI involved: these are computed from stored records only. */

export type FindingRow = {
  id: string; inspection_id: string; severity: string; category: string; review_status: string; created_at: string;
  inspections: { line_id: string | null; supplier_id: string | null; product_id: string | null; batch_id: string | null; facility_id: string | null } | null;
};

export async function loadFindings(sb: SupabaseClient, weeks = 16): Promise<FindingRow[]> {
  const since = new Date(Date.now() - weeks * 7 * 864e5).toISOString();
  const { data } = await sb
    .from('visual_findings')
    .select('id,inspection_id,severity,category,review_status,created_at,inspections(line_id,supplier_id,product_id,batch_id,facility_id)')
    .gte('created_at', since)
    .neq('review_status', 'rejected')
    .neq('review_status', 'false_positive')
    .limit(5000);
  return (data ?? []) as unknown as FindingRow[];
}

const WEEK = 7 * 864e5;
export function weekIndex(iso: string, now = Date.now()) {
  return Math.floor((now - new Date(iso).getTime()) / WEEK); // 0 = current week
}

export function weeklySeries(rows: { created_at: string }[], weeks = 12, now = Date.now()) {
  const out = Array.from({ length: weeks }, (_, i) => ({ weekAgo: weeks - 1 - i, count: 0 }));
  for (const r of rows) {
    const w = weekIndex(r.created_at, now);
    if (w >= 0 && w < weeks) out[weeks - 1 - w].count++;
  }
  return out;
}

export type Anomaly = {
  scope: string; scopeId: string | null; metric: string; baseline: number; observed: number; magnitudePct: number | null; zScore: number; weeksOfBaseline: number;
  confidence: 'low' | 'moderate'; whatChanged: string;
};

const MIN_BASELINE_WEEKS = 4;
const MIN_BASELINE_TOTAL = 6;

/** Flags the current week only when a real baseline exists. Returns reason when it cannot assess. */
export function detectWeeklySpike(rows: { created_at: string }[], label: string, scopeId: string | null, now = Date.now()) {
  const series = weeklySeries(rows, 13, now);
  const baseline = series.slice(0, 12).map((s) => s.count);
  const populated = baseline.filter((c) => c > 0).length;
  const total = baseline.reduce((a, b) => a + b, 0);
  const observed = series[12].count;
  if (populated < MIN_BASELINE_WEEKS || total < MIN_BASELINE_TOTAL) return { sufficient: false as const, anomaly: null };
  const mean = total / 12;
  const sd = Math.sqrt(baseline.reduce((a, c) => a + (c - mean) ** 2, 0) / 12) || 0.5;
  const z = (observed - mean) / sd;
  if (z < 2 || observed - mean < 2) return { sufficient: true as const, anomaly: null };
  const a: Anomaly = {
    scope: label, scopeId, metric: 'Weekly confirmed/pending findings', baseline: +mean.toFixed(2), observed,
    magnitudePct: mean > 0 ? Math.round(((observed - mean) / mean) * 100) : null, zScore: +z.toFixed(2),
    weeksOfBaseline: populated, confidence: populated >= 8 ? 'moderate' : 'low',
    whatChanged: `${label}: ${observed} findings this week versus a ${mean.toFixed(1)}/week baseline.`,
  };
  return { sufficient: true as const, anomaly: a };
}

export function groupBy<T>(rows: T[], key: (r: T) => string | null) {
  const m = new Map<string, T[]>();
  for (const r of rows) { const k = key(r); if (k) (m.get(k) ?? m.set(k, []).get(k)!).push(r); }
  return m;
}

export async function computeAnomalies(sb: SupabaseClient) {
  const findings = await loadFindings(sb, 14);
  const [lines, suppliers, products] = await Promise.all([
    sb.from('production_lines').select('id,name'), sb.from('suppliers').select('id,name'), sb.from('products').select('id,name'),
  ]);
  const names = (r: { data: { id: string; name: string }[] | null }) => new Map((r.data ?? []).map((x) => [x.id, x.name]));
  const ln = names(lines), sn = names(suppliers), pn = names(products);
  const anomalies: Anomaly[] = [];
  let sufficientAnywhere = false;
  const check = (rows: { created_at: string }[], label: string, id: string | null) => {
    const r = detectWeeklySpike(rows, label, id);
    if (r.sufficient) sufficientAnywhere = true;
    if (r.anomaly) anomalies.push(r.anomaly);
  };
  check(findings, 'All sites', null);
  for (const [id, rows] of groupBy(findings, (f) => f.inspections?.line_id ?? null)) check(rows, `Line ${ln.get(id) ?? id}`, id);
  for (const [id, rows] of groupBy(findings, (f) => f.inspections?.supplier_id ?? null)) check(rows, `Supplier ${sn.get(id) ?? id}`, id);
  for (const [id, rows] of groupBy(findings, (f) => f.inspections?.product_id ?? null)) check(rows, `Product ${pn.get(id) ?? id}`, id);
  anomalies.sort((a, b) => b.zScore - a.zScore);
  return { anomalies, sufficientAnywhere, totalFindings: findings.length, findings };
}
