import { notFound } from 'next/navigation';
import { requireOrg } from '@/lib/session';
import { geminiConfigured } from '@/lib/ai/gemini';
import { Badge, ErrorBanner, PageHeader } from '@/components/ui';
import { CREDIT_COST } from '@/lib/pricing';
import { reviewFinding, reviewInspection, runAnalysis } from '../../actions';

type Finding = { id: string; finding: string; category: string; severity: string; confidence: number; observed_evidence: string; interpretation: string | null; recommended_action: string | null; limitations: string | null; review_status: string; review_notes: string | null };

export default async function InspectionDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const { error } = await searchParams;
  const { sb } = await requireOrg();
  const { data: insp } = await sb.from('inspections').select('*, products(name), batches(lot_code), suppliers(name), production_lines(name), facilities(name)').eq('id', id).maybeSingle();
  if (!insp) notFound();
  const [{ data: img }, { data: findings }] = await Promise.all([
    sb.from('inspection_images').select('storage_path').eq('inspection_id', id).limit(1).maybeSingle(),
    sb.from('visual_findings').select('*').eq('inspection_id', id).order('created_at'),
  ]);
  const signed = img ? (await sb.storage.from('inspection-images').createSignedUrl(img.storage_path, 3600)).data?.signedUrl : null;
  const fs = (findings ?? []) as Finding[];

  return (
    <>
      <PageHeader title={insp.title} intro={`${insp.products?.name ?? 'No product'} · ${insp.batches?.lot_code ?? 'No batch'} · ${insp.production_lines?.name ?? 'No line'} · ${insp.suppliers?.name ?? 'No supplier'}`} action={<Badge v={insp.status} />} />
      <ErrorBanner error={error} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <section aria-label="Image" className="space-y-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {signed ? <img src={signed} alt={`Inspection image for ${insp.title}`} className="w-full border-2 border-char bg-sand" /> : <p className="border-2 border-dashed border-char/30 bg-cream p-8 text-center text-sm">No image uploaded.</p>}
          <form action={runAnalysis.bind(null, id)} className="panel">
            <button className="btn-sm" disabled={!signed || !geminiConfigured()}>{fs.length ? 'Re-run AI analysis' : 'Run AI analysis'}</button>
            <p className="mt-2 text-xs text-char/60">Uses {CREDIT_COST.image_analysis} credits. {!geminiConfigured() && 'The AI service is not configured on this server yet (GEMINI_API_KEY).'}</p>
          </form>
        </section>
        <section aria-label="Analysis" className="space-y-4">
          {insp.classification && <div className="panel"><p className="eyebrow">AI classification (requires review)</p><p className="mt-1"><Badge v={insp.classification} /></p><p className="mt-3 whitespace-pre-line text-sm">{insp.summary}</p></div>}
          <p className="border-l-4 border-amber bg-cream p-3 text-xs">AI output is decision support. It cannot establish microbiological, chemical, allergen or regulatory status from an image; additional testing or qualified human review may be required.</p>
          {fs.map((f) => (
            <article key={f.id} className="panel">
              <div className="flex flex-wrap items-center gap-2"><h2 className="display text-2xl">{f.finding}</h2><Badge v={f.severity} /><Badge v={f.review_status} /><span className="text-xs text-char/60">{Math.round(f.confidence * 100)}% AI confidence</span></div>
              <dl className="mt-3 space-y-2 text-sm">
                <div><dt className="label">Observed evidence</dt><dd>{f.observed_evidence}</dd></div>
                <div><dt className="label">AI interpretation</dt><dd>{f.interpretation}</dd></div>
                <div><dt className="label">Recommended next action</dt><dd>{f.recommended_action}</dd></div>
                <div><dt className="label">Limitations</dt><dd className="text-char/70">{f.limitations}</dd></div>
              </dl>
              <form action={reviewFinding.bind(null, id, f.id)} className="mt-3 flex flex-wrap items-center gap-2">
                <input name="notes" placeholder="Reviewer notes" defaultValue={f.review_notes ?? ''} aria-label="Reviewer notes" className="field max-w-xs" />
                {(['confirmed', 'rejected', 'false_positive'] as const).map((s) => <button key={s} name="status" value={s} className="btn-sm ghost">{s.replace('_', ' ')}</button>)}
              </form>
            </article>))}
          {fs.length > 0 && (
            <form action={reviewInspection.bind(null, id)} className="panel flex flex-wrap items-center gap-2">
              <input name="notes" placeholder="Inspection review notes" defaultValue={insp.review_notes ?? ''} aria-label="Inspection review notes" className="field max-w-sm" />
              {(['confirmed', 'rejected', 'closed'] as const).map((s) => <button key={s} name="status" value={s} className="btn-sm">{s}</button>)}
            </form>)}
        </section>
      </div>
    </>
  );
}
