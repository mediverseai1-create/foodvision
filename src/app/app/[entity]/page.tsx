import { notFound } from 'next/navigation';
import { requireOrg, can } from '@/lib/session';
import { ENTITIES, REF_LABEL, getPath, type Field } from '@/lib/entities';
import { Badge, Empty, ErrorBanner, PageHeader } from '@/components/ui';
import { createRecord, deleteRecord, setStatus } from '../actions';

const heading = (c: string) => c.split('.').pop()!.replace(/_/g, ' ');

export default async function EntityPage({ params, searchParams }: { params: Promise<{ entity: string }>; searchParams: Promise<{ error?: string; q?: string }> }) {
  const { entity } = await params;
  const { error, q } = await searchParams;
  const e = ENTITIES[entity];
  if (!e) notFound();
  const { sb, role } = await requireOrg();
  let query = sb.from(e.table).select(e.select).order('created_at', { ascending: false }).limit(200);
  const { data } = await query;
  let rows = (data ?? []) as unknown as Record<string, unknown>[];
  if (q) rows = rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q.toLowerCase()));

  const refs: Record<string, { id: string; label: string }[]> = {};
  for (const f of e.fields.filter((f): f is Field & { ref: NonNullable<Field['ref']> } => f.type === 'ref')) {
    const col = REF_LABEL[f.ref];
    const { data: opts } = await sb.from(f.ref).select(`id, ${col}`).limit(300);
    refs[f.name] = ((opts ?? []) as unknown as Record<string, string>[]).map((o) => ({ id: o.id, label: o[col] }));
  }
  const canDelete = can.manage(role);
  const create = createRecord.bind(null, e.key);

  return (
    <>
      <PageHeader title={e.title} intro={e.intro} />
      <ErrorBanner error={error} />
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          <form className="mb-3 flex gap-2" role="search"><input name="q" defaultValue={q} placeholder={`Search ${e.title.toLowerCase()}…`} aria-label="Search" className="field max-w-xs" /><button className="btn-sm ghost">Search</button></form>
          {rows.length === 0 ? <Empty title={e.empty.h}>{e.empty.p}</Empty> : (
            <div className="overflow-x-auto border border-sand bg-white">
              <table className="tbl"><caption className="sr-only">{e.title}</caption>
                <thead><tr>{e.columns.map((c) => <th key={c} scope="col">{heading(c)}</th>)}<th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>{rows.map((r) => (
                  <tr key={r.id as string}>
                    {e.columns.map((c) => <td key={c}>{['status', 'severity', 'priority', 'quality_status'].includes(c) ? <Badge v={r[c] as string} /> : getPath(r, c)}</td>)}
                    <td className="whitespace-nowrap">
                      {e.statusField && (
                        <form action={setStatus.bind(null, e.key, r.id as string)} className="inline-flex gap-1">
                          <select name="status" defaultValue={r[e.statusField.name] as string} aria-label="Change status" className="field !w-auto !py-1 text-xs">{e.statusField.options.map((o) => <option key={o}>{o}</option>)}</select>
                          <button className="btn-sm ghost !px-2 !py-1">Set</button>
                        </form>)}
                      {canDelete && <form action={deleteRecord.bind(null, e.key, r.id as string)} className="ml-2 inline"><button className="text-xs font-bold text-burgundy underline">Delete</button></form>}
                    </td>
                  </tr>))}
                </tbody></table>
            </div>)}
        </div>
        <form action={create} className="panel h-fit space-y-3">
          <h2 className="display text-3xl">New {e.singular}</h2>
          {e.fields.map((f) => (
            <div key={f.name}>
              <label className="label" htmlFor={f.name}>{f.label}{f.required && ' *'}</label>
              {f.type === 'textarea' ? <textarea id={f.name} name={f.name} rows={3} className="field" required={f.required} />
                : f.type === 'select' ? <select id={f.name} name={f.name} className="field" defaultValue="medium">{f.options!.map((o) => <option key={o}>{o}</option>)}</select>
                : f.type === 'ref' ? <select id={f.name} name={f.name} className="field"><option value="">— none —</option>{refs[f.name]?.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}</select>
                : <input id={f.name} name={f.name} type={f.type === 'date' ? 'date' : 'text'} className="field" required={f.required} />}
            </div>))}
          <button className="btn-sm">Add {e.singular}</button>
          <p className="text-xs text-char/60">Permissions are enforced by the database for your role.</p>
        </form>
      </div>
    </>
  );
}
