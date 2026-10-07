import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { generateStructured } from './gemini';
import { VisionResultSchema, visionJsonSchema } from './schemas';
import { withCredits } from './credits';

const MAX_BYTES = 8 * 1024 * 1024;
export const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

/** Image → vision analysis → context enrichment → validated structured findings → stored for human review. */
export async function analyzeInspection(sb: SupabaseClient, ctx: { orgId: string; userId: string }, inspectionId: string) {
  const { data: insp } = await sb.from('inspections').select('*, products(name,sku,category), batches(lot_code,produced_on), suppliers(name), production_lines(name), facilities(name)').eq('id', inspectionId).single();
  if (!insp) throw new Error('Inspection not found');
  const { data: img } = await sb.from('inspection_images').select('storage_path,mime_type').eq('inspection_id', inspectionId).order('created_at').limit(1).maybeSingle();
  if (!img) throw new Error('Upload an image before running analysis.');
  if (!ALLOWED_MIME.includes(img.mime_type ?? '')) throw new Error('Unsupported image type.');

  const file = await sb.storage.from('inspection-images').download(img.storage_path);
  if (file.error || !file.data) throw new Error('Could not read the stored image.');
  if (file.data.size > MAX_BYTES) throw new Error('Image is larger than 8 MB.');
  const b64 = Buffer.from(await file.data.arrayBuffer()).toString('base64');

  const [{ data: standards }, prior] = await Promise.all([
    sb.from('quality_standards').select('name,description'),
    sb.from('visual_findings').select('finding,category,severity,review_status').neq('review_status', 'rejected').order('created_at', { ascending: false }).limit(15),
  ]);

  await sb.from('inspections').update({ status: 'processing' }).eq('id', inspectionId);
  try {
    const result = await withCredits(sb, ctx, 'image_analysis', async () => {
      const { data, usage } = await generateStructured({
        schema: VisionResultSchema, jsonSchema: visionJsonSchema,
        system: `You are the Inspection Agent. Analyze the supplied image for quality-relevant visual signals (product defects, packaging, label legibility, process/hygiene/PPE signals, foreign material).
Inspection type: ${insp.inspection_type}. Classify only against the organization's configured quality standards; if none are configured, use the generic categories and state that no organization standard was provided.
If the image is unusable or evidence is insufficient, set image_usable=false or classification="insufficient_evidence" and return no invented findings.
For labels, transcribe only visible text and say when text is unclear; never claim legal/regulatory compliance.`,
        parts: [
          { inlineData: { mimeType: img.mime_type!, data: b64 } },
          { text: JSON.stringify({ inspection_context: { product: insp.products, batch: insp.batches, supplier: insp.suppliers, line: insp.production_lines, facility: insp.facilities }, organization_quality_standards: standards ?? [], recent_findings_for_context: prior.data ?? [] }) },
        ],
      });
      return { result: data, usage };
    });

    if (result.findings.length) {
      await sb.from('visual_findings').insert(result.findings.map((f) => ({ ...f, org_id: ctx.orgId, inspection_id: inspectionId })));
    }
    await sb.from('inspections').update({ status: 'review_required', classification: result.classification, summary: `${result.summary}\n\nClassification rationale: ${result.classification_rationale}\n\nLimitations: ${result.limitations}${result.visible_label_text ? `\n\nVisible label text (AI transcription, unverified): ${result.visible_label_text}` : ''}` }).eq('id', inspectionId);
    await sb.from('activity_logs').insert({ org_id: ctx.orgId, actor_id: ctx.userId, action: 'ai_analysis_completed', entity: 'inspection', entity_id: inspectionId });
    return result;
  } catch (e) {
    await sb.from('inspections').update({ status: 'pending' }).eq('id', inspectionId);
    throw e;
  }
}
