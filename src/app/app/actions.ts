'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requireOrg } from '@/lib/session';
import { ENTITIES } from '@/lib/entities';
import { analyzeInspection, ALLOWED_MIME } from '@/lib/ai/vision';
import { runAgent, runPipeline, AGENTS, type AgentId } from '@/lib/ai/agents';
import { AiError } from '@/lib/ai/gemini';

const msg = (e: unknown) => (e instanceof AiError ? e.message : e instanceof Error ? e.message : 'Something went wrong.');
const back = (path: string, error: string) => redirect(`${path}${path.includes('?') ? '&' : '?'}error=${encodeURIComponent(error)}`);

export async function signOut() {
  const sb = await createClient();
  await sb.auth.signOut();
  redirect('/');
}

export async function createOrganization(fd: FormData) {
  const name = z.string().min(2).safeParse(fd.get('name'));
  if (!name.success) back('/onboarding', 'Enter an organization name.');
  const sb = await createClient();
  const { error } = await sb.rpc('create_organization', { _name: name.data, _industry: String(fd.get('industry') ?? '') || null });
  if (error) back('/onboarding', error.message);
  redirect('/app');
}

export async function createRecord(entityKey: string, fd: FormData) {
  const e = ENTITIES[entityKey];
  if (!e) throw new Error('Unknown entity');
  const { sb, orgId, user } = await requireOrg();
  const row: Record<string, unknown> = { org_id: orgId };
  for (const f of e.fields) {
    const v = String(fd.get(f.name) ?? '').trim();
    if (f.required && !v) back(`/app/${entityKey}`, `${f.label} is required.`);
    row[f.name] = v || null;
  }
  for (const f of e.fields) if (f.options && !row[f.name]) delete row[f.name]; // let DB defaults apply
  if (['incidents', 'actions'].includes(entityKey)) row.created_by = user.id;
  const { error } = await sb.from(e.table).insert(row);
  if (error) back(`/app/${entityKey}`, error.message);
  revalidatePath(`/app/${entityKey}`);
  redirect(`/app/${entityKey}`);
}

export async function setStatus(entityKey: string, id: string, fd: FormData) {
  const e = ENTITIES[entityKey];
  const status = String(fd.get('status') ?? '');
  if (!e?.statusField?.options.includes(status)) return;
  const { sb } = await requireOrg();
  const { error } = await sb.from(e.table).update({ [e.statusField.name]: status }).eq('id', id);
  if (error) back(`/app/${entityKey}`, error.message);
  revalidatePath(`/app/${entityKey}`);
}

export async function deleteRecord(entityKey: string, id: string) {
  const e = ENTITIES[entityKey];
  if (!e) return;
  const { sb } = await requireOrg();
  const { error } = await sb.from(e.table).delete().eq('id', id);
  if (error) back(`/app/${entityKey}`, error.message);
  revalidatePath(`/app/${entityKey}`);
}

export async function createInspection(fd: FormData) {
  const { sb, orgId, user } = await requireOrg();
  const title = String(fd.get('title') ?? '').trim();
  if (!title) back('/app/inspections/new', 'Title is required.');
  const file = fd.get('image') as File | null;
  if (file && file.size > 0) {
    if (!ALLOWED_MIME.includes(file.type)) back('/app/inspections/new', 'Use a JPEG, PNG or WebP image.');
    if (file.size > 8 * 1024 * 1024) back('/app/inspections/new', 'Image must be 8 MB or smaller.');
  }
  const ref = (n: string) => String(fd.get(n) ?? '') || null;
  const { data: insp, error } = await sb.from('inspections').insert({
    org_id: orgId, title, inspection_type: ref('inspection_type') ?? 'product', product_id: ref('product_id'), batch_id: ref('batch_id'), supplier_id: ref('supplier_id'), facility_id: ref('facility_id'), line_id: ref('line_id'), created_by: user.id,
  }).select('id').single();
  if (error || !insp) back('/app/inspections/new', error?.message ?? 'Could not create inspection.');
  if (file && file.size > 0) {
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `${orgId}/${insp!.id}/${crypto.randomUUID()}.${ext}`;
    const up = await sb.storage.from('inspection-images').upload(path, file, { contentType: file.type });
    if (up.error) back(`/app/inspections/${insp!.id}`, `Upload failed: ${up.error.message}`);
    await sb.from('inspection_images').insert({ org_id: orgId, inspection_id: insp!.id, storage_path: path, mime_type: file.type });
  }
  await sb.from('activity_logs').insert({ org_id: orgId, actor_id: user.id, action: 'inspection_created', entity: 'inspection', entity_id: insp!.id });
  redirect(`/app/inspections/${insp!.id}`);
}

export async function runAnalysis(inspectionId: string) {
  const { sb, orgId, user } = await requireOrg();
  let err: string | null = null;
  try { await analyzeInspection(sb, { orgId, userId: user.id }, inspectionId); } catch (e) { err = msg(e); }
  revalidatePath(`/app/inspections/${inspectionId}`);
  if (err) back(`/app/inspections/${inspectionId}`, err);
}

export async function reviewFinding(inspectionId: string, findingId: string, fd: FormData) {
  const status = String(fd.get('status'));
  if (!['confirmed', 'rejected', 'false_positive', 'pending'].includes(status)) return;
  const { sb, user, orgId } = await requireOrg();
  await sb.from('visual_findings').update({ review_status: status, review_notes: String(fd.get('notes') ?? '') || null }).eq('id', findingId);
  await sb.from('activity_logs').insert({ org_id: orgId, actor_id: user.id, action: `finding_${status}`, entity: 'finding', entity_id: findingId });
  revalidatePath(`/app/inspections/${inspectionId}`);
}

export async function reviewInspection(inspectionId: string, fd: FormData) {
  const status = String(fd.get('status'));
  if (!['confirmed', 'rejected', 'closed', 'review_required'].includes(status)) return;
  const { sb, user } = await requireOrg();
  await sb.from('inspections').update({ status, reviewer_id: user.id, reviewed_at: new Date().toISOString(), review_notes: String(fd.get('notes') ?? '') || null }).eq('id', inspectionId);
  revalidatePath(`/app/inspections/${inspectionId}`);
}

export async function runAgentAction(fd: FormData) {
  const agent = String(fd.get('agent')) as AgentId | 'pipeline';
  const incidentId = String(fd.get('incident_id') ?? '') || undefined;
  const { sb, orgId, user } = await requireOrg();
  let err: string | null = null;
  try {
    if (agent === 'pipeline') await runPipeline(sb, { orgId, userId: user.id }, incidentId);
    else if (agent in AGENTS) await runAgent(sb, { orgId, userId: user.id }, agent, { incidentId });
    else err = 'Unknown agent.';
  } catch (e) { err = msg(e); }
  revalidatePath('/app/agents');
  if (err) back('/app/agents', err);
  redirect('/app/agents');
}

export async function askAssistant(fd: FormData) {
  const q = String(fd.get('question') ?? '').trim().slice(0, 1000);
  if (!q) back('/app/assistant', 'Ask a question.');
  const { sb, orgId, user } = await requireOrg();
  let err: string | null = null;
  try { await runAgent(sb, { orgId, userId: user.id }, 'assistant', { question: q }); } catch (e) { err = msg(e); }
  if (err) back('/app/assistant', err);
  redirect('/app/assistant');
}

export async function acceptRecommendation(fd: FormData) {
  const { sb, orgId, user } = await requireOrg();
  const title = String(fd.get('title') ?? '').slice(0, 200);
  const priority = String(fd.get('priority') ?? 'medium');
  if (!title) return;
  const { error } = await sb.from('corrective_actions').insert({ org_id: orgId, title, priority: ['low', 'medium', 'high', 'critical'].includes(priority) ? priority : 'medium', definition_of_done: String(fd.get('dod') ?? '') || null, created_by: user.id, notes: 'Created from an AI recommendation; requires human confirmation.' });
  if (error) back('/app/agents', error.message);
  redirect('/app/actions');
}

export async function generateReport() {
  const { sb, orgId, user } = await requireOrg();
  let err: string | null = null;
  try {
    const [insp, find, inc, act] = await Promise.all([
      sb.from('inspections').select('id', { count: 'exact', head: true }),
      sb.from('visual_findings').select('review_status'),
      sb.from('incidents').select('id', { count: 'exact', head: true }).in('status', ['open', 'investigating']),
      sb.from('corrective_actions').select('id', { count: 'exact', head: true }).in('status', ['open', 'in_progress']),
    ]);
    const f = find.data ?? [];
    const dataSection = { inspections: insp.count ?? 0, findings: f.length, confirmed: f.filter((x) => x.review_status === 'confirmed').length, rejected_or_false_positive: f.filter((x) => x.review_status !== 'confirmed' && x.review_status !== 'pending').length, open_incidents: inc.count ?? 0, open_actions: act.count ?? 0 };
    const { output } = await runAgent(sb, { orgId, userId: user.id }, 'quality', { question: 'Write a concise quality summary report for the team.' });
    await sb.from('reports').insert({ org_id: orgId, title: `Quality summary — ${new Date().toISOString().slice(0, 10)}`, kind: 'quality_summary', data_section: dataSection, interpretation: { headline: output.headline, evidence: output.observed_evidence, patterns: output.related_patterns, contributors: output.possible_contributors, limitations: output.limitations, confidence: output.confidence }, recommendations: output.recommended_actions, created_by: user.id });
  } catch (e) { err = msg(e); }
  if (err) back('/app/reports', err);
  redirect('/app/reports');
}

export async function insightFeedback(runId: string, fd: FormData) {
  const { sb } = await requireOrg();
  const fb = String(fd.get('feedback'));
  if (!['useful', 'not_useful'].includes(fb)) return;
  await sb.from('ai_insights').update({ feedback: fb, feedback_note: String(fd.get('note') ?? '') || null }).eq('id', runId);
  revalidatePath('/app');
}
