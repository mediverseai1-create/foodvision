import Link from 'next/link';
import { requireOrg } from '@/lib/session';
import { Badge, Empty, PageHeader } from '@/components/ui';

export default async function Inspections({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const { sb } = await requireOrg();
  let q = sb.from('inspections').select('id,title,status,classification,created_at,products(name),batches(lot_code),production_lines(name)').order('created_at', { ascending: false }).limit(200);
  if (status) q = q.eq('status', status);
  const { data } = await q;
  const rows = (data ?? []) as unknown as { id: string; title: string; status: string; classification: string | null; created_at: string; products: { name: string } | null; batches: { lot_code: string } | null; production_lines: { name: string } | null }[];
  return (
    <>
      <PageHeader title="Inspections" intro="Upload → analyze → review → confirm. AI findings are never treated as confirmed failures until a reviewer confirms them."
        action={<div className="flex gap-2"><Link href="/app/inspections/new" className="btn-sm">New inspection</Link></div>} />
      <nav aria-label="Filter by status" className="mb-4 flex flex-wrap gap-2 text-xs font-bold">
        {['', 'pending', 'processing', 'review_required', 'confirmed', 'rejected', 'closed'].map((s) => <Link key={s} href={s ? `?status=${s}` : '?'} className={`px-3 py-1 ${status === s || (!status && !s) ? 'bg-char text-white' : 'bg-sand'}`}>{s ? s.replace('_', ' ') : 'all'}</Link>)}
      </nav>
      {rows.length === 0 ? <Empty title="Start your first inspection" href="/app/inspections/new" cta="New inspection">Upload an inspection image and connect it to a product or batch to begin building your quality intelligence.</Empty> : (
        <div className="overflow-x-auto border border-sand bg-white"><table className="tbl"><caption className="sr-only">Inspections</caption>
          <thead><tr><th scope="col">Inspection</th><th scope="col">Product</th><th scope="col">Batch</th><th scope="col">Line</th><th scope="col">Classification</th><th scope="col">Status</th><th scope="col">Date</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.id}><td><Link className="font-bold text-burgundy underline" href={`/app/inspections/${r.id}`}>{r.title}</Link></td><td>{r.products?.name ?? '—'}</td><td>{r.batches?.lot_code ?? '—'}</td><td>{r.production_lines?.name ?? '—'}</td><td><Badge v={r.classification} /></td><td><Badge v={r.status} /></td><td>{r.created_at.slice(0, 10)}</td></tr>)}</tbody></table></div>)}
    </>
  );
}
