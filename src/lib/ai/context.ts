import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { computeAnomalies } from '@/lib/intel';

/** Context builder: only reads through the user's RLS-scoped client, so agents see only what the user may see. */
export async function buildOrgContext(sb: SupabaseClient, opts: { incidentId?: string } = {}) {
  const [{ anomalies, sufficientAnywhere, totalFindings }, findings, incidents, actions, batches, standards, haccp] = await Promise.all([
    computeAnomalies(sb),
    sb.from('visual_findings').select('finding,category,severity,confidence,review_status,created_at,inspections(title,products(name),batches(lot_code),suppliers(name),production_lines(name))').order('created_at', { ascending: false }).limit(40),
    sb.from('incidents').select('id,title,status,severity,description,created_at,batches(lot_code),suppliers(name),products(name)').order('created_at', { ascending: false }).limit(20),
    sb.from('corrective_actions').select('title,priority,status,due_date').neq('status', 'done').limit(20),
    sb.from('batches').select('lot_code,quality_status,produced_on,products(name),suppliers(name),production_lines(name)').order('created_at', { ascending: false }).limit(40),
    sb.from('quality_standards').select('name,description'),
    sb.from('haccp_records').select('hazard,ccp,deviation,corrective_action,recorded_on').order('created_at', { ascending: false }).limit(20),
  ]);
  let focus: unknown = undefined;
  if (opts.incidentId) focus = (await sb.from('incidents').select('*, batches(lot_code), suppliers(name), products(name), facilities(name)').eq('id', opts.incidentId).maybeSingle()).data;
  return {
    data_sufficiency: { findings_in_window: totalFindings, baseline_available: sufficientAnywhere },
    computed_anomalies: anomalies,
    recent_findings: findings.data ?? [],
    incidents: incidents.data ?? [],
    open_actions: actions.data ?? [],
    batches: batches.data ?? [],
    organization_quality_standards: standards.data ?? [],
    haccp_records: haccp.data ?? [],
    focus_incident: focus,
  };
}
