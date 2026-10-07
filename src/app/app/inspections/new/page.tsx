import { requireOrg } from '@/lib/session';
import { ErrorBanner, PageHeader } from '@/components/ui';
import { createInspection } from '../../actions';

export default async function NewInspection({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { sb } = await requireOrg();
  const [p, b, s, f, l] = await Promise.all([
    sb.from('products').select('id,name'), sb.from('batches').select('id,lot_code'), sb.from('suppliers').select('id,name'), sb.from('facilities').select('id,name'), sb.from('production_lines').select('id,name'),
  ]);
  const Sel = ({ name, label, rows, k }: { name: string; label: string; rows: Record<string, string>[] | null; k: string }) => (
    <div><label className="label" htmlFor={name}>{label}</label><select id={name} name={name} className="field"><option value="">— none —</option>{(rows ?? []).map((r) => <option key={r.id} value={r.id}>{r[k]}</option>)}</select></div>
  );
  return (
    <>
      <PageHeader title="New inspection" intro="Connect the image to operational context so findings can feed pattern detection. JPEG, PNG or WebP up to 8 MB." />
      <ErrorBanner error={error} />
      <form action={createInspection} className="panel grid max-w-3xl gap-4 md:grid-cols-2">
        <div className="md:col-span-2"><label className="label" htmlFor="title">Title *</label><input id="title" name="title" required className="field" /></div>
        <div><label className="label" htmlFor="inspection_type">Type</label><select id="inspection_type" name="inspection_type" className="field"><option value="product">Product</option><option value="packaging">Packaging</option><option value="label">Label</option><option value="process">Process / production line</option></select></div>
        <Sel name="product_id" label="Product" rows={p.data} k="name" /><Sel name="batch_id" label="Batch / lot" rows={b.data} k="lot_code" /><Sel name="supplier_id" label="Supplier" rows={s.data} k="name" />
        <Sel name="facility_id" label="Facility" rows={f.data} k="name" /><Sel name="line_id" label="Production line" rows={l.data} k="name" />
        <div className="md:col-span-2"><label className="label" htmlFor="image">Image</label><input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp" className="field" /></div>
        <div className="md:col-span-2"><button className="btn-sm">Create inspection</button></div>
      </form>
    </>
  );
}
