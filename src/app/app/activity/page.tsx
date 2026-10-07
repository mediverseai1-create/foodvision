import { requireOrg } from '@/lib/session';
import { Empty, PageHeader } from '@/components/ui';

export default async function Activity() {
  const { sb } = await requireOrg();
  const { data } = await sb.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(100);
  return (
    <>
      <PageHeader title="Activity" intro="A record of inspections, AI analyses and reviews." />
      {(data ?? []).length === 0 ? <Empty title="No activity yet">Actions such as creating inspections and reviewing findings are logged here.</Empty> : (
        <div className="overflow-x-auto border border-sand bg-white">
          <table className="tbl"><caption className="sr-only">Activity</caption>
            <thead><tr><th scope="col">When</th><th scope="col">Action</th><th scope="col">Entity</th></tr></thead>
            <tbody>{data!.map((a) => <tr key={a.id}><td>{a.created_at.slice(0, 16).replace('T', ' ')}</td><td>{a.action.replace(/_/g, ' ')}</td><td>{a.entity}</td></tr>)}</tbody>
          </table>
        </div>)}
    </>
  );
}
