'use client';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function TrendChart({ data }: { data: { label: string; count: number }[] }) {
  return (
    <div role="img" aria-label={`Weekly findings: ${data.map((d) => `${d.label} ${d.count}`).join(', ')}`} className="h-56 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="#e8dccb" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6d5d58' }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6d5d58' }} />
          <Tooltip cursor={{ fill: '#f6efe4' }} />
          <Bar dataKey="count" name="Findings" fill="#7a1f2b" radius={[1, 1, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
