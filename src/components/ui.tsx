import Link from 'next/link';

export function PageHeader({ title, intro, action }: { title: string; intro?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b-2 border-char pb-4">
      <div><h1 className="display text-5xl">{title}</h1>{intro && <p className="mt-2 max-w-2xl text-sm text-char/70">{intro}</p>}</div>
      {action}
    </div>
  );
}

export function ErrorBanner({ error }: { error?: string }) {
  if (!error) return null;
  return <p role="alert" className="mb-4 border-l-4 border-burgundy bg-rose/10 p-3 text-sm text-burgundy">{error}</p>;
}

export function Empty({ title, children, href, cta }: { title: string; children: React.ReactNode; href?: string; cta?: string }) {
  return (
    <div className="border-2 border-dashed border-char/30 bg-cream p-10 text-center">
      <h2 className="display text-3xl">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-char/70">{children}</p>
      {href && <Link href={href} className="btn-sm mt-5 inline-flex">{cta}</Link>}
    </div>
  );
}

const TONE: Record<string, string> = {
  confirmed: 'bg-sage-soft text-sage', closed: 'bg-sage-soft text-sage', resolved: 'bg-sage-soft text-sage', done: 'bg-sage-soft text-sage', acceptable: 'bg-sage-soft text-sage',
  critical: 'bg-burgundy text-white', critical_review: 'bg-burgundy text-white', high: 'bg-rose/20 text-burgundy', defect_detected: 'bg-rose/20 text-burgundy',
  review_required: 'bg-amber/20 text-amber', medium: 'bg-amber/20 text-amber', processing: 'bg-amber/20 text-amber', investigating: 'bg-amber/20 text-amber',
};
export function Badge({ v }: { v: string | null | undefined }) {
  if (!v) return <span className="text-char/40">—</span>;
  return <span className={`inline-block px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${TONE[v] ?? 'bg-sand text-char/80'}`}>{v.replace(/_/g, ' ')}</span>;
}

export function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return <div className="panel"><p className="eyebrow text-char/60">{label}</p><p className="display mt-1 text-5xl text-burgundy">{value}</p>{hint && <p className="mt-1 text-xs text-char/60">{hint}</p>}</div>;
}
